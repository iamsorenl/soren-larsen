import { README_CACHE_TTL_SECONDS } from './constants.js';

// Short TTL for negative-cache markers: a repo whose README fetch failed is
// not retried for this long, so known-bad repos aren't refetched per request.
export const README_NEGATIVE_TTL_SECONDS = 600;

const NEGATIVE_KEY_PREFIX = 'unavailable:';

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

/**
 * Retrieve a negative-cache 'unavailable' marker for a repo.
 * @param {KVNamespace} kv
 * @param {string} repoSlug - normalized "owner/repo"
 * @returns {Promise<{ reason: string }|null>} Marker or null when absent.
 */
export async function getUnavailableMarker(kv, repoSlug) {
  const val = await kv.get(NEGATIVE_KEY_PREFIX + repoSlug, 'json');
  if (!val || !val.unavailable) return null;
  return { reason: val.reason || 'readme fetch recently failed' };
}

/**
 * Store a short-TTL negative-cache marker after a failed README fetch.
 * @param {KVNamespace} kv
 * @param {string} repoSlug - normalized "owner/repo"
 * @param {string} reason - why the fetch failed
 */
export async function putUnavailableMarker(kv, repoSlug, reason) {
  const entry = {
    unavailable: true,
    reason,
    failedAt: new Date().toISOString(),
    source: 'github-readme',
  };
  await kv.put(NEGATIVE_KEY_PREFIX + repoSlug, JSON.stringify(entry), {
    expirationTtl: README_NEGATIVE_TTL_SECONDS,
  });
}
