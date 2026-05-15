const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export class GroqUpstreamError extends Error {
  constructor(status, body) {
    super(`Groq upstream error ${status}: ${body}`);
    this.status = status;
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

export async function groqChatStream({ apiKey, model, messages, systemPrompt }) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildPayload({ model, messages, systemPrompt, stream: true })),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new GroqUpstreamError(res.status, body);
  }
  return parseSseToText(res.body);
}

export async function groqChatJson({ apiKey, model, messages, systemPrompt }) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildPayload({ model, messages, systemPrompt, stream: false })),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new GroqUpstreamError(res.status, body);
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? '';
}

/**
 * Non-streaming Groq call that supports tools and tool_choice.
 * Returns the raw message object from choices[0].message so the caller
 * can inspect tool_calls if present.
 * @param {{ apiKey: string, model: string, messages: object[], systemPrompt: string, tools?: object[], tool_choice?: string }} opts
 * @returns {Promise<object>} message object with role, content, tool_calls?
 */
export async function groqChatNonStreaming({ apiKey, model, messages, systemPrompt, tools, tool_choice }) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildPayload({ model, messages, systemPrompt, stream: false, tools, tool_choice })),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new GroqUpstreamError(res.status, body);
  }
  const json = await res.json();
  return json.choices?.[0]?.message ?? { role: 'assistant', content: '' };
}

export function parseSseToText(upstream) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  return new ReadableStream({
    async start(controller) {
      const reader = upstream.getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop();
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === '[DONE]') continue;
            try {
              const event = JSON.parse(payload);
              const text = event.choices?.[0]?.delta?.content;
              if (text) controller.enqueue(encoder.encode(text));
            } catch {
              // skip malformed events
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });
}
