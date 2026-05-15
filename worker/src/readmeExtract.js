// Stopwords and keyword extraction — identical logic to systemPrompt.js
const STOPWORDS = new Set([
  'the', 'and', 'but', 'for', 'with', 'about', 'into', 'what', 'when', 'where',
  'how', 'why', 'who', 'whom', 'his', 'him', 'her', 'she', 'they', 'them',
  'their', 'this', 'that', 'these', 'those', 'has', 'have', 'had', 'was',
  'were', 'are', 'been', 'being', 'soren', 'does', 'did', 'doing', 'tell',
  'know', 'can', 'could', 'would', 'should', 'will', 'any', 'some', 'most',
  'much', 'many', 'few', 'one', 'two', 'three', 'me', 'us', 'you', 'your',
]);

function extractKeywords(query) {
  return (query || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function scoreSection(text, keywords) {
  if (keywords.length === 0) return 0;
  const lower = text.toLowerCase();
  let score = 0;
  for (const kw of keywords) if (lower.includes(kw)) score += 1;
  return score;
}

function estimateTokens(text) {
  return Math.ceil((text || '').length / 4);
}

/**
 * Split markdown into sections by h1–h3 headings.
 * The first element is all text before the first heading (the overview).
 * Each subsequent element starts with the heading line.
 * @param {string} markdown
 * @returns {string[]}
 */
function splitSections(markdown) {
  const lines = (markdown || '').split('\n');
  const sections = [];
  let current = [];

  for (const line of lines) {
    if (/^#{1,3} /.test(line) && current.length > 0) {
      sections.push(current.join('\n'));
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) sections.push(current.join('\n'));
  return sections.filter((s) => s.trim().length > 0);
}

/**
 * Extract the most relevant sections of a README for a given user question.
 * Always includes the first section (overview). Remaining sections are scored
 * against the user question with keyword matching and greedily added until the
 * token budget is exhausted.
 *
 * @param {string} markdown - Raw README content.
 * @param {string} userQuestion - Latest user message.
 * @param {number} maxTokens - Token budget (characters/4 heuristic).
 * @returns {string} Concatenated selected sections.
 */
export function extractRelevantSections(markdown, userQuestion, maxTokens) {
  if (!markdown || !markdown.trim()) return '';

  const sections = splitSections(markdown);

  // No headings — treat entire README as one section, hard truncate
  if (sections.length <= 1) {
    const text = sections[0] || markdown;
    const limit = maxTokens * 4; // chars
    return text.length > limit ? text.slice(0, limit) : text;
  }

  const keywords = extractKeywords(userQuestion);

  // Always include the overview (sections[0])
  const overview = sections[0];
  let tokenCount = estimateTokens(overview);
  const selected = [overview];

  // Score the rest
  const rest = sections.slice(1).map((s) => ({ text: s, score: scoreSection(s, keywords) }));
  rest.sort((a, b) => b.score - a.score);

  for (const { text } of rest) {
    const t = estimateTokens(text);
    if (tokenCount + t > maxTokens) continue;
    selected.push(text);
    tokenCount += t;
  }

  return selected.join('\n\n');
}
