const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Timeout budgets for Groq fetches. HEADER_TIMEOUT_MS bounds the wait for
// response headers; STREAM_INACTIVITY_MS is a watchdog between streamed
// chunks so a stalled upstream can't hang a client connection forever.
export const HEADER_TIMEOUT_MS = 15000;
export const STREAM_INACTIVITY_MS = 20000;

export class GroqUpstreamError extends Error {
  constructor(status, body, headers = null) {
    super(`Groq upstream error ${status}: ${body}`);
    this.status = status;
    this.headers = headers;
  }
}

function buildPayload({ model, messages, systemPrompt, stream, tools, tool_choice }) {
  const payload = {
    model,
    stream,
    temperature: 0.2,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
  };
  if (tools) payload.tools = tools;
  if (tool_choice) payload.tool_choice = tool_choice;
  return payload;
}

/**
 * POST to Groq with an AbortController timeout on response headers.
 * Throws GroqUpstreamError on abort (status 504) or non-2xx responses;
 * non-2xx errors carry the response headers so callers can read Groq's
 * structured retry-after / x-ratelimit-* values.
 * @param {string} apiKey
 * @param {object} payload
 * @returns {Promise<Response>}
 */
async function groqFetch(apiKey, payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HEADER_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    if (err && (err.name === 'AbortError' || err.name === 'TimeoutError')) {
      throw new GroqUpstreamError(504, `request timed out after ${HEADER_TIMEOUT_MS}ms waiting for response headers`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    const body = await res.text();
    throw new GroqUpstreamError(res.status, body, res.headers);
  }
  return res;
}

export async function groqChatStream({ apiKey, model, messages, systemPrompt }) {
  const res = await groqFetch(apiKey, buildPayload({ model, messages, systemPrompt, stream: true }));
  return parseSseToText(res.body);
}

export async function groqChatJson({ apiKey, model, messages, systemPrompt }) {
  const res = await groqFetch(apiKey, buildPayload({ model, messages, systemPrompt, stream: false }));
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? '';
}

/**
 * Single streaming Groq call with tools + tool_choice. Reads the SSE stream
 * just far enough to tell whether the model is answering directly or calling
 * a tool:
 * - Plain content deltas → resolves { kind: 'content', stream } where stream
 *   is a text ReadableStream that pipes deltas straight through (nothing is
 *   buffered beyond the first delta).
 * - tool_calls deltas → buffers silently, assembles the complete tool call(s)
 *   from the argument fragments, and resolves { kind: 'tool_calls', toolCalls }.
 * @param {{ apiKey: string, model: string, messages: object[], systemPrompt: string, tools?: object[], tool_choice?: string }} opts
 * @returns {Promise<{ kind: 'content', stream: ReadableStream } | { kind: 'tool_calls', toolCalls: object[] }>}
 */
export async function groqChatStreamAuto({ apiKey, model, messages, systemPrompt, tools, tool_choice }) {
  const res = await groqFetch(
    apiKey,
    buildPayload({ model, messages, systemPrompt, stream: true, tools, tool_choice })
  );
  const events = createSseEventReader(res.body);

  // Peek events until the first meaningful delta decides the path.
  while (true) {
    let event;
    try {
      event = await events.next();
    } catch (err) {
      events.cancel();
      throw err;
    }
    if (event === null) {
      // Stream ended without any deltas — treat as an empty content stream.
      return { kind: 'content', stream: contentStream(events, '') };
    }
    const delta = event.choices?.[0]?.delta;
    if (delta?.tool_calls) {
      const toolCalls = [];
      mergeToolCallDeltas(toolCalls, delta.tool_calls);
      try {
        while (true) {
          const next = await events.next();
          if (next === null) break;
          const nextDeltas = next.choices?.[0]?.delta?.tool_calls;
          if (nextDeltas) mergeToolCallDeltas(toolCalls, nextDeltas);
        }
      } catch (err) {
        events.cancel();
        throw err;
      }
      // Compact sparse indexes; if assembly somehow produced nothing, fall
      // back to an (already-drained, hence empty) content stream.
      const assembled = toolCalls.filter(Boolean);
      if (assembled.length === 0) return { kind: 'content', stream: contentStream(events, '') };
      return { kind: 'tool_calls', toolCalls: assembled };
    }
    if (delta?.content) {
      return { kind: 'content', stream: contentStream(events, delta.content) };
    }
    // role-only / empty delta — keep reading.
  }
}

/**
 * Accumulate OpenAI-style streaming tool_call delta fragments into complete
 * tool call objects, keyed by delta index.
 * @param {object[]} acc
 * @param {object[]} deltas
 */
function mergeToolCallDeltas(acc, deltas) {
  for (const d of deltas) {
    const i = typeof d.index === 'number' ? d.index : 0;
    if (!acc[i]) acc[i] = { id: '', type: 'function', function: { name: '', arguments: '' } };
    if (d.id) acc[i].id = d.id;
    if (d.type) acc[i].type = d.type;
    if (d.function?.name) acc[i].function.name += d.function.name;
    if (d.function?.arguments) acc[i].function.arguments += d.function.arguments;
  }
}

/**
 * Race a reader.read() against the stream inactivity watchdog. If no chunk
 * arrives within STREAM_INACTIVITY_MS the read rejects with a
 * GroqUpstreamError(504) and the upstream reader is cancelled.
 */
async function readWithInactivityTimeout(reader) {
  let timer;
  try {
    return await Promise.race([
      reader.read(),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          // Reject first: cancelling settles the pending read() as done, which
          // would otherwise win the race and look like a clean end-of-stream.
          reject(new GroqUpstreamError(504, `stream stalled: no data for ${STREAM_INACTIVITY_MS}ms`));
          reader.cancel('inactivity timeout').catch(() => {});
        }, STREAM_INACTIVITY_MS);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Wrap an SSE byte stream as a pull-based iterator of parsed JSON events.
 * next() resolves with the next event object, or null when the stream ends.
 * Malformed events are skipped; [DONE] sentinels are filtered out.
 */
function createSseEventReader(upstream) {
  const reader = upstream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const queue = [];
  return {
    async next() {
      while (true) {
        if (queue.length) return queue.shift();
        const { value, done } = await readWithInactivityTimeout(reader);
        if (done) return null;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;
          try {
            queue.push(JSON.parse(payload));
          } catch {
            // skip malformed events
          }
        }
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  };
}

/**
 * Build a text ReadableStream that emits firstChunk (if any) then pipes
 * every subsequent content delta through. Upstream failures are logged and
 * surfaced via controller.error() so the client's read rejects instead of
 * seeing a silently-truncated answer.
 */
function contentStream(events, firstChunk) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        if (firstChunk) controller.enqueue(encoder.encode(firstChunk));
        while (true) {
          const event = await events.next();
          if (event === null) break;
          const text = event.choices?.[0]?.delta?.content;
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (err) {
        console.error('groq stream error', err);
        events.cancel();
        controller.error(err);
      }
    },
  });
}

export function parseSseToText(upstream) {
  return contentStream(createSseEventReader(upstream), '');
}
