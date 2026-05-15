import about from './data/about.json';
import experience from './data/experience.json';
import projects from './data/projects.json';
import skills from './data/skills.json';
import education from './data/education.json';
import certifications from './data/certifications.json';
import highlights from './data/highlights.json';
import contact from './data/contact.json';

// Stopwords pruned aggressively so scoring picks up signal words ("react",
// "ucsc", "founding") and ignores noise ("what", "his", "the").
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

function scoreEntry(entry, keywords) {
  if (keywords.length === 0) return 0;
  const text = JSON.stringify(entry).toLowerCase();
  let score = 0;
  for (const kw of keywords) if (text.includes(kw)) score += 1;
  return score;
}

function topKEntries(entries, keywords, k) {
  return entries
    .map((entry, idx) => ({ entry, idx, score: scoreEntry(entry, keywords) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.idx - b.idx)
    .slice(0, k)
    .map((s) => s.entry);
}

// Retrieves the entries to inline for a given query. Always includes about,
// contact, highlights, skills (small). For experience, always pin the most
// recent entry (index 0 since experience.json is recency-sorted), then add
// up to two additional matches. For projects/education/certifications, pick
// top-K by keyword score; if nothing matches, omit those sections entirely.
export function retrieveContext(latestUserMessage) {
  const keywords = extractKeywords(latestUserMessage);
  const sections = {};

  sections.about = about;
  sections.contact = contact;
  sections.highlights = highlights;
  sections.skills = skills;

  const recentExperience = experience.slice(0, 1);
  const matchedExperience = topKEntries(experience.slice(1), keywords, 2);
  sections.experience = [...recentExperience, ...matchedExperience];

  const matchedProjects = topKEntries(projects, keywords, 3);
  if (matchedProjects.length > 0) sections.projects = matchedProjects;
  else if (keywords.length === 0) sections.projects = projects.slice(0, 2);

  const matchedEducation = topKEntries(education, keywords, 2);
  if (matchedEducation.length > 0) sections.education = matchedEducation;
  else sections.education = education.slice(0, 1);

  const matchedCerts = topKEntries(certifications, keywords, 3);
  if (matchedCerts.length > 0) sections.certifications = matchedCerts;

  return sections;
}

function renderSections(sections) {
  return Object.entries(sections)
    .map(([name, data]) => `${name.toUpperCase()}:\n${JSON.stringify(data, null, 2)}`)
    .join('\n\n');
}

export function buildSystemPrompt(sessionSummary, latestUserMessage = '') {
  const sections = retrieveContext(latestUserMessage);
  const facts = renderSections(sections);
  return `You are "Soren's Assistant", a concise factual assistant on Soren Larsen's portfolio site.
Your audience is recruiters and hiring managers evaluating Soren's fit.

RULES:
- Answer ONLY from the FACTS below. Do not invent experience, skills, or details.
- If asked about opinions, preferences, salary, availability, visa, or anything
  not in FACTS, reply "That's a great question for Soren directly — you can
  reach him via the Contact section."
- If a question is partially answerable, answer what you can and redirect for the rest.
- Refer to Soren in third person ("Soren", "he"). Never speak as Soren.
- Keep answers under 4 sentences unless asked for detail. No marketing fluff.

FACTS (authoritative source for all claims):
${facts}

PRIOR CONVERSATION SUMMARY (if any):
${sessionSummary || '(none)'}`;
}

// Rough character → token heuristic (English ≈ 4 chars/token). Good enough
// for budget gating without pulling in a real tokenizer.
export function estimateTokens(text) {
  return Math.ceil((text || '').length / 4);
}

export function estimateRequestTokens({ systemPrompt, messages }) {
  let total = estimateTokens(systemPrompt);
  for (const m of messages) total += estimateTokens(m.content) + 8; // small per-message overhead
  return total;
}

// Per-request token budget. Set so two requests within a minute fit under the
// 12k TPM free-tier cap with headroom.
export const MAX_PROMPT_TOKENS = 5500;

export const SUMMARIZE_SYSTEM_PROMPT = `You summarize chat conversations on a recruiter-facing portfolio site.
Produce a concise summary (max 3 sentences) of what the visitor asked and what Soren's Assistant said.
Refer to participants as "the visitor" and "Soren's Assistant". Output ONLY the summary text, no preamble.`;
