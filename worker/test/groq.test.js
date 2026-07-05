import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  groqChatStream,
  groqChatStreamAuto,
  groqChatJson,
  parseSseToText,
  GroqUpstreamError,
  HEADER_TIMEOUT_MS,
  STREAM_INACTIVITY_MS,
} from '../src/groq.js';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function readAll(stream) {
  const reader = stream.getReader();
  const dec = new TextDecoder();
  let result = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    result += dec.decode(value);
  }
  return result;
}

function sseStream(events) {
  return new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      for (const e of events) controller.enqueue(enc.encode(e));
      controller.close();
    },
  });
}

describe('parseSseToText', () => {
  it('extracts delta.content from each data event', async () => {
    const upstream = sseStream([
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
      'data: [DONE]\n\n',
    ]);
    const out = parseSseToText(upstream);
    const reader = out.getReader();
    const dec = new TextDecoder();
    let result = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      result += dec.decode(value);
    }
    expect(result).toBe('Hello world');
  });

  it('skips malformed JSON gracefully', async () => {
    const upstream = sseStream([
      'data: not-json\n\n',
      'data: {"choices":[{"delta":{"content":"ok"}}]}\n\n',
      'data: [DONE]\n\n',
    ]);
    const out = parseSseToText(upstream);
    const reader = out.getReader();
    const dec = new TextDecoder();
    let result = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      result += dec.decode(value);
    }
    expect(result).toBe('ok');
  });

  it('errors (not closes) the output stream when the upstream fails mid-stream', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const enc = new TextEncoder();
    const upstream = new ReadableStream({
      start(c) {
        c.enqueue(enc.encode('data: {"choices":[{"delta":{"content":"partial"}}]}\n\n'));
        c.error(new Error('upstream connection dropped'));
      },
    });
    const out = parseSseToText(upstream);
    // The client's read must reject (errored stream), not resolve done (closed).
    await expect(readAll(out)).rejects.toThrow('upstream connection dropped');
    expect(errSpy).toHaveBeenCalledWith('groq stream error', expect.any(Error));
  });

  it('errors the output stream when the upstream stalls past the inactivity watchdog', async () => {
    vi.useFakeTimers();
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const enc = new TextEncoder();
    const upstream = new ReadableStream({
      start(c) {
        c.enqueue(enc.encode('data: {"choices":[{"delta":{"content":"partial"}}]}\n\n'));
        // never closes — simulates a stalled upstream
      },
    });
    const out = parseSseToText(upstream);
    const reader = out.getReader();
    const first = await reader.read();
    expect(new TextDecoder().decode(first.value)).toBe('partial');
    const pending = reader.read();
    const expectation = expect(pending).rejects.toMatchObject({ status: 504 });
    await vi.advanceTimersByTimeAsync(STREAM_INACTIVITY_MS + 1);
    await expectation;
    await expect(pending).rejects.toBeInstanceOf(GroqUpstreamError);
    expect(errSpy).toHaveBeenCalledWith('groq stream error', expect.any(Error));
  });
});

describe('groqChatStream', () => {
  it('POSTs to Groq with stream=true and returns a text stream', async () => {
    const upstream = sseStream([
      'data: {"choices":[{"delta":{"content":"hi"}}]}\n\n',
      'data: [DONE]\n\n',
    ]);
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(upstream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } })
    );
    const stream = await groqChatStream({
      apiKey: 'k',
      model: 'm',
      messages: [{ role: 'user', content: 'hi' }],
      systemPrompt: 's',
    });
    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://api.groq.com/openai/v1/chat/completions');
    expect(opts.headers.Authorization).toBe('Bearer k');
    const body = JSON.parse(opts.body);
    expect(body.stream).toBe(true);
    expect(body.messages[0].role).toBe('system');
    expect(body.messages[1].content).toBe('hi');
    const reader = stream.getReader();
    const { value } = await reader.read();
    expect(new TextDecoder().decode(value)).toBe('hi');
  });

  it('throws GroqUpstreamError on non-2xx', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('boom', { status: 500 }));
    await expect(
      groqChatStream({ apiKey: 'k', model: 'm', messages: [], systemPrompt: 's' })
    ).rejects.toThrow(/Groq/);
  });

  it('exposes the upstream response headers on non-2xx errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('limited', { status: 429, headers: { 'retry-after': '42' } })
    );
    let caught;
    try {
      await groqChatStream({ apiKey: 'k', model: 'm', messages: [], systemPrompt: 's' });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(GroqUpstreamError);
    expect(caught.status).toBe(429);
    expect(caught.headers.get('retry-after')).toBe('42');
  });

  it('maps a header-phase abort to GroqUpstreamError 504 after HEADER_TIMEOUT_MS', async () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, 'fetch').mockImplementation((url, opts) =>
      new Promise((resolve, reject) => {
        opts.signal.addEventListener('abort', () => {
          const err = new Error('The operation was aborted');
          err.name = 'AbortError';
          reject(err);
        });
      })
    );
    const p = groqChatStream({ apiKey: 'k', model: 'm', messages: [], systemPrompt: 's' });
    const expectation = expect(p).rejects.toMatchObject({ status: 504 });
    await vi.advanceTimersByTimeAsync(HEADER_TIMEOUT_MS + 1);
    await expectation;
    await expect(p).rejects.toBeInstanceOf(GroqUpstreamError);
  });
});

describe('groqChatStreamAuto', () => {
  it('pipes plain content deltas through with a single fetch', async () => {
    const upstream = sseStream([
      'data: {"choices":[{"delta":{"role":"assistant"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
      'data: [DONE]\n\n',
    ]);
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(upstream, { status: 200 }));
    const result = await groqChatStreamAuto({
      apiKey: 'k',
      model: 'm',
      messages: [{ role: 'user', content: 'hi' }],
      systemPrompt: 's',
      tools: [{ type: 'function', function: { name: 'fetch_repo_readme' } }],
      tool_choice: 'auto',
    });
    expect(result.kind).toBe('content');
    expect(await readAll(result.stream)).toBe('Hello world');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.stream).toBe(true);
    expect(body.tool_choice).toBe('auto');
    expect(body.tools).toHaveLength(1);
  });

  it('assembles a complete tool call from split deltas', async () => {
    const argStr = JSON.stringify({ github_url: 'https://github.com/iamsorenl/EduMUSE' });
    const upstream = sseStream([
      'data: {"choices":[{"delta":{"role":"assistant","content":null}}]}\n\n',
      `data: ${JSON.stringify({
        choices: [{
          delta: {
            tool_calls: [{
              index: 0,
              id: 'tc_9',
              type: 'function',
              function: { name: 'fetch_repo_readme', arguments: '' },
            }],
          },
        }],
      })}\n\n`,
      `data: ${JSON.stringify({
        choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: argStr.slice(0, 15) } }] } }],
      })}\n\n`,
      `data: ${JSON.stringify({
        choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: argStr.slice(15) } }] } }],
      })}\n\n`,
      'data: [DONE]\n\n',
    ]);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(upstream, { status: 200 }));
    const result = await groqChatStreamAuto({
      apiKey: 'k',
      model: 'm',
      messages: [{ role: 'user', content: 'how does EduMUSE work?' }],
      systemPrompt: 's',
      tools: [{ type: 'function', function: { name: 'fetch_repo_readme' } }],
      tool_choice: 'auto',
    });
    expect(result.kind).toBe('tool_calls');
    expect(result.toolCalls).toHaveLength(1);
    expect(result.toolCalls[0].id).toBe('tc_9');
    expect(result.toolCalls[0].type).toBe('function');
    expect(result.toolCalls[0].function.name).toBe('fetch_repo_readme');
    expect(JSON.parse(result.toolCalls[0].function.arguments)).toEqual({
      github_url: 'https://github.com/iamsorenl/EduMUSE',
    });
  });

  it('returns an empty content stream when the upstream ends with no deltas', async () => {
    const upstream = sseStream(['data: [DONE]\n\n']);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(upstream, { status: 200 }));
    const result = await groqChatStreamAuto({
      apiKey: 'k',
      model: 'm',
      messages: [{ role: 'user', content: 'hi' }],
      systemPrompt: 's',
    });
    expect(result.kind).toBe('content');
    expect(await readAll(result.stream)).toBe('');
  });
});

describe('groqChatJson', () => {
  it('returns content from non-streaming response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: 'summary text' } }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    const text = await groqChatJson({
      apiKey: 'k',
      model: 'm',
      messages: [{ role: 'user', content: 'x' }],
      systemPrompt: 's',
    });
    expect(text).toBe('summary text');
  });
});
