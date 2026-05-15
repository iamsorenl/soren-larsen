import { describe, it, expect, vi, afterEach } from 'vitest';
import { executeToolCall, TOOLS_SPEC } from '../src/tools.js';

afterEach(() => { vi.restoreAllMocks(); });

class MockKV {
  constructor() { this.store = new Map(); }
  async get(key, type) {
    const v = this.store.get(key);
    if (v === undefined) return null;
    return type === 'json' ? JSON.parse(v) : v;
  }
  async put(key, value, opts) { this.store.set(key, String(value)); }
}

const baseEnv = {
  GITHUB_TOKEN: 'test-token',
  README_CACHE: new MockKV(),
};

describe('TOOLS_SPEC', () => {
  it('exports an array with fetch_repo_readme tool', () => {
    expect(Array.isArray(TOOLS_SPEC)).toBe(true);
    expect(TOOLS_SPEC[0].function.name).toBe('fetch_repo_readme');
    expect(TOOLS_SPEC[0].type).toBe('function');
    expect(TOOLS_SPEC[0].function.parameters.required).toContain('github_url');
  });
});

describe('executeToolCall', () => {
  it('returns unavailable JSON for unknown tool name', async () => {
    const result = await executeToolCall(
      { function: { name: 'unknown_tool', arguments: '{}' } },
      baseEnv,
      'what is this?'
    );
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('unavailable');
  });

  it('routes fetch_repo_readme and returns sections on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('# Overview\nThis project does X.\n\n## Architecture\nUses React.', { status: 200 })
    );
    const result = await executeToolCall(
      {
        function: {
          name: 'fetch_repo_readme',
          arguments: JSON.stringify({ github_url: 'https://github.com/iamsorenl/EduMUSE' }),
        },
      },
      { ...baseEnv, README_CACHE: new MockKV() },
      'how does EduMUSE work?'
    );
    // Should be a markdown string, not JSON
    expect(result).toContain('Overview');
  });

  it('returns fallback JSON on GithubNotFoundError (404)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('not found', { status: 404 }));
    const result = await executeToolCall(
      {
        function: {
          name: 'fetch_repo_readme',
          arguments: JSON.stringify({ github_url: 'https://github.com/iamsorenl/nonexistent' }),
        },
      },
      { ...baseEnv, README_CACHE: new MockKV() },
      'tell me about this project'
    );
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('unavailable');
    expect(parsed.reason).toBeTruthy();
  });

  it('returns fallback JSON on GithubAuthError (403)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('forbidden', { status: 403 }));
    const result = await executeToolCall(
      {
        function: {
          name: 'fetch_repo_readme',
          arguments: JSON.stringify({ github_url: 'https://github.com/iamsorenl/private-repo' }),
        },
      },
      { ...baseEnv, README_CACHE: new MockKV() },
      'tell me about this project'
    );
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('unavailable');
  });

  it('returns fallback JSON when github_url is missing', async () => {
    const result = await executeToolCall(
      { function: { name: 'fetch_repo_readme', arguments: '{}' } },
      baseEnv,
      'question'
    );
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('unavailable');
  });

  it('returns fallback JSON when arguments is invalid JSON', async () => {
    const result = await executeToolCall(
      { function: { name: 'fetch_repo_readme', arguments: 'not-json' } },
      baseEnv,
      'question'
    );
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('unavailable');
  });

  it('serves from KV cache on second call without hitting GitHub', async () => {
    const kv = new MockKV();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('# Cached README', { status: 200 })
    );

    const toolCall = {
      function: {
        name: 'fetch_repo_readme',
        arguments: JSON.stringify({ github_url: 'https://github.com/iamsorenl/EduMUSE' }),
      },
    };
    const env = { ...baseEnv, README_CACHE: kv };

    // First call — goes to GitHub
    await executeToolCall(toolCall, env, 'tell me about EduMUSE');
    const firstCallCount = fetchSpy.mock.calls.length;

    // Second call — should hit KV cache, NOT GitHub
    await executeToolCall(toolCall, env, 'tell me about EduMUSE');
    expect(fetchSpy.mock.calls.length).toBe(firstCallCount); // no new fetch
  });
});
