import { README_CACHE_TTL_SECONDS } from './constants.js';

/**
 * Normalize a repo slug to a consistent KV cache key.
 * - Lowercased
 * - Strip .git suffix
 * - Strip trailing slash
 * @param {string} owner
 * @param {string} repo
 * @returns {string} e.g. "iamsorenl/edumuse"
 */
export function normalizeSlug(owner, repo) {
  const o = owner.toLowerCase().trim();
  const r = repo.toLowerCase().trim().replace(/\.git$/, '').replace(/\/$/, '');
  return `${o}/${r}`;
}

/**
 * Retrieve cached README sections from KV.
 * @param {KVNamespace} kv
 * @param {string} repoSlug - normalized "owner/repo"
 * @returns {Promise<string|null>} Cached sections string or null on miss.
 */
export async function getCachedReadme(kv, repoSlug) {
  const val = await kv.get(repoSlug, 'json');
  if (!val) return null;
  return val.sections ?? null;
}

/**
 * Store README sections in KV with TTL.
 * @param {KVNamespace} kv
 * @param {string} repoSlug - normalized "owner/repo"
 * @param {string} sections - extracted sections string
 */
export async function putCachedReadme(kv, repoSlug, sections) {
  const entry = {
    sections,
    fetchedAt: new Date().toISOString(),
    source: 'github-readme',
  };
  await kv.put(repoSlug, JSON.stringify(entry), {
    expirationTtl: README_CACHE_TTL_SECONDS,
  });
}
