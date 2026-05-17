import { parseGithubUrl, fetchReadmeRaw, GithubNotFoundError, GithubAuthError, GithubRateLimitError, GithubNetworkError } from './github.js';
import { extractRelevantSections } from './readmeExtract.js';
import { getCachedReadme, putCachedReadme, normalizeSlug } from './readmeCache.js';
import { README_MAX_TOKENS } from './constants.js';

export const TOOLS_SPEC = [
  {
    type: 'function',
    function: {
      name: 'fetch_repo_readme',
      description:
        "Fetch and return the most relevant sections of a GitHub repository's README. Use this when the visitor asks for deeper detail about one of Soren's projects — architecture, implementation choices, technical depth, etc. — and the project's JSON entry doesn't have enough context. You MUST copy the value of the project's `link` field VERBATIM from PROJECTS in the FACTS section. Do not guess, construct, normalize, or modify the URL — owners and repo names are not predictable from the project title.",
      parameters: {
        type: 'object',
        properties: {
          github_url: {
            type: 'string',
            description: "The exact `link` value from the matching PROJECTS entry. Copy it character-for-character — do not invent or alter the owner or repo name.",
          },
        },
        required: ['github_url'],
      },
    },
  },
];

/**
 * Execute a tool call from the model and return the result string.
 * @param {{ function: { name: string, arguments: string } }} toolCall
 * @param {object} env - Worker env bindings (GITHUB_TOKEN, README_CACHE)
 * @param {string} userQuestion - Latest user message for section scoring
 * @returns {Promise<string>} Tool result content
 */
export async function executeToolCall(toolCall, env, userQuestion) {
  const name = toolCall?.function?.name;
  if (name === 'fetch_repo_readme') {
    return fetchRepoReadme(toolCall.function.arguments, env, userQuestion);
  }
  return JSON.stringify({ status: 'unavailable', reason: `unknown tool: ${name}` });
}

async function fetchRepoReadme(argsStr, env, userQuestion) {
  let args;
  try {
    args = JSON.parse(argsStr);
  } catch {
    return JSON.stringify({ status: 'unavailable', reason: 'invalid tool arguments' });
  }

  const { github_url } = args;
  if (!github_url) {
    return JSON.stringify({ status: 'unavailable', reason: 'missing github_url argument' });
  }

  let owner, repo;
  try {
    ({ owner, repo } = parseGithubUrl(github_url));
  } catch (err) {
    return JSON.stringify({ status: 'unavailable', reason: `invalid github url: ${err.message}` });
  }

  const slug = normalizeSlug(owner, repo);

  // KV cache lookup
  if (env.README_CACHE) {
    try {
      const cached = await getCachedReadme(env.README_CACHE, slug);
      if (cached) return cached;
    } catch (err) {
      console.error('readme cache get error', err);
    }
  }

  // Fetch from GitHub with PAT auth when configured. The token comes from
  // env.GITHUB_TOKEN (Cloudflare Worker secret).
  let markdown;
  try {
    markdown = await fetchReadmeRaw({ owner, repo, token: env.GITHUB_TOKEN });
  } catch (err) {
    if (err instanceof GithubNotFoundError) {
      console.error('github readme not found', { owner, repo });
      return JSON.stringify({ status: 'unavailable', reason: 'readme not found' });
    }
    if (err instanceof GithubRateLimitError) {
      console.error('github rate limit', { owner, repo, detail: err.detail });
      return JSON.stringify({ status: 'unavailable', reason: 'github rate limit hit' });
    }
    if (err instanceof GithubAuthError) {
      console.error('github auth error', { owner, repo, detail: err.detail });
      return JSON.stringify({ status: 'unavailable', reason: 'github auth error' });
    }
    if (err instanceof GithubNetworkError) {
      console.error('github network error', err.message);
      return JSON.stringify({ status: 'unavailable', reason: 'github network error' });
    }
    console.error('unexpected github error', err);
    return JSON.stringify({ status: 'unavailable', reason: 'github fetch failed' });
  }

  if (!markdown || !markdown.trim()) {
    return JSON.stringify({ status: 'unavailable', reason: 'empty readme' });
  }

  const sections = extractRelevantSections(markdown, userQuestion, README_MAX_TOKENS);

  // Store in cache
  if (env.README_CACHE && sections) {
    try {
      await putCachedReadme(env.README_CACHE, slug, sections);
    } catch (err) {
      console.error('readme cache put error', err);
    }
  }

  return sections;
}
