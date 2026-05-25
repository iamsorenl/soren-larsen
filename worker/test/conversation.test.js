// Conversational/multi-turn tests for the chat handler. The other chat tests
// cover single-call paths; these check what happens as a recruiter sends
// multiple turns and chat history accumulates.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { handleChat } from '../src/chat.js';
import { estimateRequestTokens, buildSystemPrompt, MAX_PROMPT_TOKENS } from '../src/systemPrompt.js';

class MockKV {
  constructor() { this.store = new Map(); }
  async get(key, type) {
    const v = this.store.get(key);
    if (v === undefined) return null;
    return type === 'json' ? JSON.parse(v) : v;
  }
  async put(key, value) { this.store.set(key, value); }
}

const baseEnv = {
  GROQ_API_KEY: 'k',
  GROQ_MODEL: 'llama-3.3-70b-versatile',
  ALLOWED_ORIGINS: 'http://localhost:3000',
  RATE_LIMIT: new MockKV(),
};

afterEach(() => { vi.restoreAllMocks(); });

function mockGroqStream(text) {
  const enc = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(c) {
        c.enqueue(enc.encode(`data: {"choices":[{"delta":{"content":${JSON.stringify(text)}}}]}\n\n`));
        c.enqueue(enc.encode('data: [DONE]\n\n'));
        c.close();
      },
    }),
    { status: 200 }
  );
}

/** Phase 1 non-streaming response with no tool call — used to seed the two-phase flow. */
function mockGroqPhase1NoTool(content = 'ok') {
  return new Response(
    JSON.stringify({ choices: [{ message: { role: 'assistant', content } }] }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

function buildRequest(messages, sessionSummary = null, ip = '1.2.3.4') {
  return new Request('http://x/api/chat', {
    method: 'POST',
    body: JSON.stringify({ messages, sessionSummary }),
    headers: {
      'Content-Type': 'application/json',
      'CF-Connecting-IP': ip,
    },
  });
}

describe('multi-turn under budget', () => {
  it('accepts a realistic 6-turn recruiter conversation', async () => {
    // Two-phase flow: Phase 1 returns JSON (no tool), Phase 2 returns SSE stream
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockGroqPhase1NoTool('ok'))
      .mockResolvedValueOnce(mockGroqStream('ok'));
    const env = { ...baseEnv, RATE_LIMIT: new MockKV(), README_CACHE: new MockKV() };

    const messages = [
      { role: 'user', content: "What was Soren's most recent role?" },
      { role: 'assistant', content: 'Soren is the founding engineer at Levangie Laboratories.' },
      { role: 'user', content: 'How long was he there?' },
      { role: 'assistant', content: 'He started in February 2026 and is currently there.' },
      { role: 'user', content: 'What was he doing before that?' },
      { role: 'assistant', content: 'Before Levangie, he was at Gray Whale as a data engineer.' },
      { role: 'user', content: 'Tell me about his NLP background.' },
    ];

    const res = await handleChat(buildRequest(messages), env);
    expect(res.status).toBe(200);
  });

  it('accepts a single-message conversation about projects', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockGroqPhase1NoTool('ok'))
      .mockResolvedValueOnce(mockGroqStream('ok'));
    const env = { ...baseEnv, RATE_LIMIT: new MockKV(), README_CACHE: new MockKV() };

    const res = await handleChat(
      buildRequest([{ role: 'user', content: 'What projects has he worked on?' }]),
      env
    );
    expect(res.status).toBe(200);
  });
});

describe('multi-turn at the budget edge', () => {
  it('413s when accumulated history pushes past MAX_PROMPT_TOKENS', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockGroqStream('ok'));
    const env = { ...baseEnv, RATE_LIMIT: new MockKV() };

    // 8 user/assistant pairs of ~500 tokens each plus a multi-section
    // (experience+projects+certs) trigger query should cross the budget.
    const bigContent = 'x'.repeat(2000); // ~508 tokens per message
    const history = [];
    for (let i = 0; i < 10; i++) {
      history.push({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: bigContent,
      });
    }
    history.push({ role: 'user', content: 'Tell me about all his jobs and projects and certs.' });

    const res = await handleChat(buildRequest(history), env);
    expect(res.status).toBe(413);
    const json = await res.json();
    expect(json.error).toBe('too_large');
  });

  it('allows a follow-up after the same history has been compacted into a summary', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockGroqPhase1NoTool('ok'))
      .mockResolvedValueOnce(mockGroqStream('ok'));
    const env = { ...baseEnv, RATE_LIMIT: new MockKV(), README_CACHE: new MockKV() };

    // Same large history simulated as compacted → just one user message plus
    // the (frontend-supplied) summary should fit comfortably.
    const messages = [{ role: 'user', content: 'Tell me about his NLP work.' }];
    const sessionSummary = 'The visitor previously asked about Soren\'s roles at Levangie and Gray Whale. Soren\'s Assistant covered employment dates and tech stacks.';

    const req = new Request('http://x/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, sessionSummary }),
      headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '2.3.4.5' },
    });
    const res = await handleChat(req, env);
    expect(res.status).toBe(200);
  });
});

// Llama's tokenizer can produce up to ~1.5× the count of a naive chars/4
// heuristic for JSON-heavy text (lots of quotes, punctuation, identifiers).
// We allow this much slack between what the estimator says and what real
// Groq accounting will charge. The estimator stays simple; the budget
// accommodates the variance.
const ESTIMATOR_VARIANCE_FACTOR = 1.5;
const GROQ_FREE_TIER_TPM = 12000;

describe('token budget safety margin', () => {
  it('worst-case prompt × variance factor still fits TPM single-request', () => {
    const sp = buildSystemPrompt(
      null,
      'Tell me about all his jobs and projects and education.'
    );
    const worstCaseRequest = estimateRequestTokens({
      systemPrompt: sp,
      messages: [{ role: 'user', content: 'Tell me everything.' }],
    });
    expect(worstCaseRequest * ESTIMATOR_VARIANCE_FACTOR).toBeLessThan(GROQ_FREE_TIER_TPM);
  });

  it('typical prompt × variance factor fits two requests under TPM', () => {
    const sp = buildSystemPrompt(null, "What's his tech stack?");
    const typicalRequest = estimateRequestTokens({
      systemPrompt: sp,
      messages: [{ role: 'user', content: "What's his tech stack?" }],
    });
    expect(typicalRequest * ESTIMATOR_VARIANCE_FACTOR * 2).toBeLessThan(GROQ_FREE_TIER_TPM);
  });

  it('MAX_PROMPT_TOKENS leaves room for variance under the single-request TPM cap', () => {
    expect(MAX_PROMPT_TOKENS * ESTIMATOR_VARIANCE_FACTOR).toBeLessThan(GROQ_FREE_TIER_TPM);
  });
});

describe('token estimate sanity for realistic conversations', () => {
  // Sanity checks on the budgeting math itself — these don't hit the handler,
  // they verify that real conversations of a given shape land where we expect.

  it('a 4-turn conversation with a topical-experience query fits under budget', () => {
    const sp = buildSystemPrompt(null, 'What other roles has he had?');
    const messages = [
      { role: 'user', content: 'Hi, can you tell me about Soren?' },
      { role: 'assistant', content: 'Sure — Soren is an AI and full-stack engineer who recently finished his MS in NLP at UCSC.' },
      { role: 'user', content: 'What was his most recent role?' },
      { role: 'assistant', content: 'Soren is currently the founding engineer at Levangie Laboratories.' },
      { role: 'user', content: 'What other roles has he had?' },
    ];
    expect(estimateRequestTokens({ systemPrompt: sp, messages })).toBeLessThan(MAX_PROMPT_TOKENS);
  });

  it('a 6-turn conversation with a project-name query fits under budget', () => {
    const sp = buildSystemPrompt(null, 'Tell me more about No RAGrets.');
    const messages = [
      { role: 'user', content: 'Hi.' },
      { role: 'assistant', content: 'Hello.' },
      { role: 'user', content: 'What projects has he worked on?' },
      { role: 'assistant', content: 'Several — including No RAGrets, EduMUSE, the UCSC RAG Chatbot, and others.' },
      { role: 'user', content: 'Tell me more about No RAGrets.' },
    ];
    expect(estimateRequestTokens({ systemPrompt: sp, messages })).toBeLessThan(MAX_PROMPT_TOKENS);
  });

  it('a chat history of just one mega-message + topical query 413s without a summary', () => {
    const sp = buildSystemPrompt(null, 'List ALL his jobs and projects.');
    const giantHistory = [{ role: 'user', content: 'x'.repeat(20000) }];
    expect(estimateRequestTokens({ systemPrompt: sp, messages: giantHistory })).toBeGreaterThan(MAX_PROMPT_TOKENS);
  });
});
