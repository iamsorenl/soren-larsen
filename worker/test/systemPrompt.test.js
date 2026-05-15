import { describe, it, expect } from 'vitest';
import {
  buildSystemPrompt,
  retrieveContext,
  estimateTokens,
  estimateRequestTokens,
  MAX_PROMPT_TOKENS,
  SUMMARIZE_SYSTEM_PROMPT,
} from '../src/systemPrompt.js';

describe('buildSystemPrompt', () => {
  it('includes the persona header', () => {
    const p = buildSystemPrompt(null);
    expect(p).toContain("Soren's Assistant");
    expect(p).toContain('FACTS');
  });

  it('always includes ABOUT and CONTACT sections', () => {
    const p = buildSystemPrompt(null, "What's his most recent role?");
    expect(p).toContain('ABOUT:');
    expect(p).toContain('CONTACT:');
  });

  it('appends summary when provided', () => {
    const p = buildSystemPrompt('Earlier: visitor asked about X.');
    expect(p).toContain('PRIOR CONVERSATION SUMMARY');
    expect(p).toContain('Earlier: visitor asked about X.');
  });

  it('uses "(none)" when no summary provided', () => {
    const p = buildSystemPrompt(null);
    expect(p).toContain('(none)');
  });

  it('still fits within the token budget for a typical question', () => {
    const p = buildSystemPrompt(null, "What's his tech stack?");
    expect(estimateTokens(p)).toBeLessThan(MAX_PROMPT_TOKENS);
  });
});

describe('retrieveContext', () => {
  it('always includes about, contact, highlights, skills, experience, education', () => {
    const sections = retrieveContext('');
    expect(sections.about).toBeDefined();
    expect(sections.contact).toBeDefined();
    expect(sections.highlights).toBeDefined();
    expect(sections.skills).toBeDefined();
    expect(sections.experience).toBeDefined();
    expect(sections.education).toBeDefined();
  });

  it('pins the most recent experience entry regardless of query', () => {
    const sections = retrieveContext('completely unrelated query foobar');
    expect(Array.isArray(sections.experience)).toBe(true);
    expect(sections.experience.length).toBeGreaterThanOrEqual(1);
  });

  it('retrieves project entries when query mentions projects', () => {
    const sections = retrieveContext('What NLP projects has he worked on?');
    expect(sections.projects).toBeDefined();
    expect(Array.isArray(sections.projects)).toBe(true);
    expect(sections.projects.length).toBeGreaterThan(0);
  });

  it('omits certifications when query has no relevant keywords', () => {
    const sections = retrieveContext("What's his favorite color?");
    expect(sections.certifications).toBeUndefined();
  });

  it('limits experience entries to at most 3 (1 recent + 2 matched)', () => {
    const sections = retrieveContext('engineer engineer engineer engineer');
    expect(sections.experience.length).toBeLessThanOrEqual(3);
  });
});

describe('estimateTokens', () => {
  it('rough chars/4 heuristic', () => {
    expect(estimateTokens('test')).toBe(1);
    expect(estimateTokens('hello world')).toBe(3);
    expect(estimateTokens('')).toBe(0);
    expect(estimateTokens(null)).toBe(0);
  });
});

describe('estimateRequestTokens', () => {
  it('sums system prompt and per-message content with overhead', () => {
    const total = estimateRequestTokens({
      systemPrompt: 'abcd', // 1 token
      messages: [
        { role: 'user', content: 'abcd' }, // 1 + 8
        { role: 'assistant', content: 'abcd' }, // 1 + 8
      ],
    });
    expect(total).toBe(1 + 9 + 9);
  });
});

describe('MAX_PROMPT_TOKENS', () => {
  it('is set so two requests fit under Groq free-tier 12k TPM', () => {
    expect(MAX_PROMPT_TOKENS * 2).toBeLessThanOrEqual(12000);
  });
});

describe('SUMMARIZE_SYSTEM_PROMPT', () => {
  it('instructs the model to be concise', () => {
    expect(SUMMARIZE_SYSTEM_PROMPT).toMatch(/concise|short|brief/i);
  });
});
