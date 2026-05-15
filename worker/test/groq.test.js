import { describe, it, expect, vi, afterEach } from 'vitest';
import { groqChatStream, groqChatJson, parseSseToText } from '../src/groq.js';

afterEach(() => { vi.restoreAllMocks(); });

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
