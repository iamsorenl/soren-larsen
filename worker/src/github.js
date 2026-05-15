const GITHUB_README_URL = 'https://api.github.com/repos/{owner}/{repo}/readme';
const FETCH_TIMEOUT_MS = 8000;

export class GithubNotFoundError extends Error {
  constructor(owner, repo) {
    super(`GitHub repo not found: ${owner}/${repo}`);
    this.name = 'GithubNotFoundError';
  }
}

export class GithubAuthError extends Error {
  constructor() {
    super('GitHub auth failed (403)');
    this.name = 'GithubAuthError';
  }
}

export class GithubNetworkError extends Error {
  constructor(cause) {
    super(`GitHub network error: ${cause}`);
    this.name = 'GithubNetworkError';
  }
}

/**
 * Parse a GitHub URL into owner and repo components.
 * @param {string} url - e.g. "https://github.com/iamsorenl/EduMUSE"
 * @returns {{ owner: string, repo: string }}
 */
export function parseGithubUrl(url) {
  if (!url) throw new Error('url is required');
  // Normalize: strip .git, trailing slash, protocol
  const clean = url.trim().replace(/\.git$/, '').replace(/\/$/, '');
  const match = clean.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error(`Not a valid GitHub URL: ${url}`);
  return { owner: match[1], repo: match[2] };
}

async function doFetch(owner, repo) {
  const url = GITHUB_README_URL.replace('{owner}', owner).replace('{repo}', repo);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    // Unauthenticated request — relies on the 60/hr-per-egress-IP anonymous
    // GitHub limit, which is plenty given our 24h KV cache reduces actual
    // outbound fetches to ~one per project per day after warmup.
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.raw+json',
        'User-Agent': 'soren-larsen-chat-worker/1.0',
      },
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch a repository's raw README markdown anonymously.
 * Retries once on 5xx / network errors.
 * @param {{ owner: string, repo: string }} opts
 * @returns {Promise<string>} raw markdown
 */
export async function fetchReadmeRaw({ owner, repo }) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    let res;
    try {
      res = await doFetch(owner, repo);
    } catch (err) {
      // Network / timeout
      lastError = new GithubNetworkError(err.message || String(err));
      continue; // retry
    }

    if (res.status === 404) {
      throw new GithubNotFoundError(owner, repo);
    }
    if (res.status === 403) {
      throw new GithubAuthError();
    }
    if (res.status >= 500) {
      lastError = new GithubNetworkError(`HTTP ${res.status}`);
      continue; // retry
    }
    if (!res.ok) {
      throw new GithubNetworkError(`HTTP ${res.status}`);
    }

    const text = await res.text();
    return text;
  }
  throw lastError;
}
