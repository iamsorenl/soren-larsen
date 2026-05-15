import { describe, it, expect, vi } from 'vitest';
import { normalizeSlug, getCachedReadme, putCachedReadme } from '../src/readmeCache.js';

class MockKV {
  constructor() { this.store = new Map(); }
  async get(key, type) {
    const v = this.store.get(key);
    if (v === undefined) return null;
    return type === 'json' ? JSON.parse(v) : v;
  }
  async put(key, value, opts) { this.store.set(key, String(value)); }
}

describe('normalizeSlug', () => {
  it('lowercases owner and repo', () => {
    expect(normalizeSlug('IamSorenL', 'EduMUSE')).toBe('iamsorenl/edumuse');
  });

  it('strips .git suffix', () => {
    expect(normalizeSlug('foo', 'bar.git')).toBe('foo/bar');
  });

  it('strips trailing slash from repo', () => {
    expect(normalizeSlug('foo', 'bar/')).toBe('foo/bar');
  });

  it('handles already-clean slug', () => {
    expect(normalizeSlug('alice', 'project')).toBe('alice/project');
  });
});

describe('getCachedReadme / putCachedReadme', () => {
  it('returns null on cache miss', async () => {
    const kv = new MockKV();
    const result = await getCachedReadme(kv, 'owner/repo');
    expect(result).toBeNull();
  });

  it('round-trips: put then get returns the sections string', async () => {
    const kv = new MockKV();
    const slug = 'iamsorenl/edumuse';
    const sections = '## Architecture\nThis uses React.';
    await putCachedReadme(kv, slug, sections);
    const retrieved = await getCachedReadme(kv, slug);
    expect(retrieved).toBe(sections);
  });

  it('put stores a JSON entry with sections, fetchedAt, source fields', async () => {
    const kv = new MockKV();
    const slug = 'test/repo';
    await putCachedReadme(kv, slug, 'some sections');
    const raw = kv.store.get(slug);
    const parsed = JSON.parse(raw);
    expect(parsed.sections).toBe('some sections');
    expect(parsed.fetchedAt).toBeTruthy();
    expect(parsed.source).toBe('github-readme');
  });

  it('returns null when stored value has no sections field', async () => {
    const kv = new MockKV();
    kv.store.set('odd/key', JSON.stringify({ fetchedAt: '2024-01-01' }));
    const result = await getCachedReadme(kv, 'odd/key');
    expect(result).toBeNull();
  });
});
