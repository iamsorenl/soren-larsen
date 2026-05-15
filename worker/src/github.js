const GITHUB_README_URL = 'https://api.github.com/repos/{owner}/{repo}/readme';
const FETCH_TIMEOUT_MS = 8000;

export class GithubNotFoundError extends Error {
  constructor(owner, repo) {
    super(`GitHub repo not found: ${owner}/${repo}`);
    this.name = 'GithubNotFoundError';
  }
}

export class GithubAuthError extends Error {
  constructor(detail) {
    super(`GitHub auth failed (403): ${detail}`);
    this.name = 'GithubAuthError';
    this.detail = detail;
  }
}

export class GithubRateLimitError extends Error {
  constructor(detail) {
    super(`GitHub rate limit (403): ${detail}`);
    this.name = 'GithubRateLimitError';
    this.detail = detail;
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

async function doFetch(owner, repo, token) {
  const url = GITHUB_README_URL.replace('{owner}', owner).replace('{repo}', repo);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const headers = {
      Accept: 'application/vnd.github.raw+json',
      'User-Agent': 'soren-larsen-chat-worker/1.0',
    };
    // Add Bearer auth when a token is configured. The PAT lifts our rate
    // limit from 60/hr per shared Cloudflare egress IP (anonymous) up to
    // 5000/hr per token, which is what makes the chat reliable on a shared
    // edge platform.
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, { headers, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch a repository's raw README markdown.
 * Retries once on 5xx / network errors.
 * @param {{ owner: string, repo: string, token?: string }} opts
 * @returns {Promise<string>} raw markdown
 */
export async function fetchReadmeRaw({ owner, repo, token }) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    let res;
    try {
      res = await doFetch(owner, repo, token);
    } catch (err) {
      // Network / timeout
      lastError = new GithubNetworkError(err.message || String(err));
      continue; // retry
    }

    if (res.status === 404) {
      throw new GithubNotFoundError(owner, repo);
    }
    if (res.status === 403) {
      // GitHub returns 403 for both "rate limit exceeded" and "scope/permission
      // problem". The body distinguishes them. We read it so the log surfaces
      // the real cause instead of an opaque "auth failed".
      const rawBody = await res.text();
      let detail = rawBody.slice(0, 300);
      try {
        const json = JSON.parse(rawBody);
        if (json.message) detail = json.message;
      } catch { /* keep raw body */ }
      const isRateLimit = /rate limit|api rate limit exceeded/i.test(detail);
      throw isRateLimit ? new GithubRateLimitError(detail) : new GithubAuthError(detail);
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
