import { describe, it, expect, vi, afterEach } from 'vitest';
import { parseGithubUrl, fetchReadmeRaw, GithubNotFoundError, GithubAuthError, GithubNetworkError } from '../src/github.js';

afterEach(() => { vi.restoreAllMocks(); });

describe('parseGithubUrl', () => {
  it('parses a standard github URL', () => {
    const { owner, repo } = parseGithubUrl('https://github.com/iamsorenl/EduMUSE');
    expect(owner).toBe('iamsorenl');
    expect(repo).toBe('EduMUSE');
  });

  it('strips .git suffix', () => {
    const { owner, repo } = parseGithubUrl('https://github.com/iamsorenl/EduMUSE.git');
    expect(owner).toBe('iamsorenl');
    expect(repo).toBe('EduMUSE');
  });

  it('strips trailing slash', () => {
    const { owner, repo } = parseGithubUrl('https://github.com/iamsorenl/EduMUSE/');
    expect(owner).toBe('iamsorenl');
    expect(repo).toBe('EduMUSE');
  });

  it('throws on non-github URL', () => {
    expect(() => parseGithubUrl('https://example.com/foo/bar')).toThrow();
  });

  it('throws on empty input', () => {
    expect(() => parseGithubUrl('')).toThrow();
  });
});

describe('fetchReadmeRaw', () => {
  it('returns raw markdown on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('# Hello\nWorld', { status: 200 })
    );
    const text = await fetchReadmeRaw({ owner: 'foo', repo: 'bar' });
    expect(text).toBe('# Hello\nWorld');
  });

  it('calls the correct GitHub API URL', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('readme', { status: 200 })
    );
    await fetchReadmeRaw({ owner: 'alice', repo: 'proj' });
    const [url, opts] = spy.mock.calls[0];
    expect(url).toBe('https://api.github.com/repos/alice/proj/readme');
    // Anonymous fetch — no Authorization header should be sent.
    expect(opts.headers.Authorization).toBeUndefined();
    expect(opts.headers.Accept).toBe('application/vnd.github.raw+json');
  });

  it('throws GithubNotFoundError on 404', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('not found', { status: 404 }));
    await expect(fetchReadmeRaw({ owner: 'a', repo: 'b' }))
      .rejects.toBeInstanceOf(GithubNotFoundError);
  });

  it('throws GithubAuthError on 403', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('forbidden', { status: 403 }));
    await expect(fetchReadmeRaw({ owner: 'a', repo: 'b' }))
      .rejects.toBeInstanceOf(GithubAuthError);
  });

  it('retries once on 500 then throws GithubNetworkError', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('server error', { status: 500 })
    );
    await expect(fetchReadmeRaw({ owner: 'a', repo: 'b' }))
      .rejects.toBeInstanceOf(GithubNetworkError);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('retries once on network error then throws GithubNetworkError', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network fail'));
    await expect(fetchReadmeRaw({ owner: 'a', repo: 'b' }))
      .rejects.toBeInstanceOf(GithubNetworkError);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('succeeds on second attempt if first fails with 500', async () => {
    const spy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('err', { status: 500 }))
      .mockResolvedValueOnce(new Response('# OK', { status: 200 }));
    const text = await fetchReadmeRaw({ owner: 'a', repo: 'b' });
    expect(text).toBe('# OK');
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
