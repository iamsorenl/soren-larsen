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

// Topic words that indicate the user is asking *about a category* rather than
// about a specific entity inside it. When any of these match, we include the
// whole list for that section instead of running entry-level scoring (which
// would miss because entries don't usually contain the word "role" or "project"
// in their own descriptions).
const SECTION_TOPIC_KEYWORDS = {
  experience: [
    'role', 'roles', 'job', 'jobs', 'work', 'works', 'worked', 'working',
    'company', 'companies', 'employ', 'employed', 'employer', 'employers',
    'employment', 'career', 'position', 'positions', 'experience',
    'experiences', 'history', 'previously', 'previous', 'currently',
    'recent', 'internship', 'intern',
  ],
  projects: [
    'project', 'projects', 'built', 'building', 'build', 'app', 'apps',
    'application', 'applications', 'tool', 'tools', 'made', 'created',
    'create', 'creating', 'repo', 'repos', 'github repo', 'shipped',
    'shipping', 'side project',
  ],
  certifications: [
    'cert', 'certs', 'certification', 'certifications', 'license', 'licenses',
    'credential', 'credentials',
  ],
  education: [
    'school', 'schools', 'university', 'universities', 'college', 'colleges',
    'degree', 'degrees', 'education', 'academic', 'gpa', 'ucsc',
    'santa cruz', 'masters', 'bachelor', 'graduate', 'graduated', 'studied',
    'study', 'coursework',
  ],
};

function isSectionRelevant(queryLower, sectionName) {
  return SECTION_TOPIC_KEYWORDS[sectionName].some((kw) => queryLower.includes(kw));
}

// Retrieves the entries to inline for a given query.
//
// Strategy:
// - about / contact / highlights / skills / education: always included (small).
// - experience: always pin the most recent role. If the question topically
//   targets experience ("roles", "work history", etc.), include all roles so
//   list-style questions get full coverage; otherwise add up to 2 entry-level
//   keyword matches.
// - projects / certifications: include the full list when topically targeted;
//   otherwise fall back to entry-level top-K matches (or omit if nothing
//   scores).
export function retrieveContext(latestUserMessage) {
  const queryLower = (latestUserMessage || '').toLowerCase();
  const keywords = extractKeywords(latestUserMessage);
  const sections = {};

  sections.about = about;
  sections.contact = contact;
  sections.highlights = highlights;
  sections.skills = skills;
  sections.education = education;

  if (isSectionRelevant(queryLower, 'experience')) {
    sections.experience = experience;
  } else {
    const recentExperience = experience.slice(0, 1);
    const matchedExperience = topKEntries(experience.slice(1), keywords, 2);
    sections.experience = [...recentExperience, ...matchedExperience];
  }

  if (isSectionRelevant(queryLower, 'projects')) {
    sections.projects = projects;
  } else {
    const matched = topKEntries(projects, keywords, 3);
    if (matched.length > 0) sections.projects = matched;
  }

  if (isSectionRelevant(queryLower, 'certifications')) {
    sections.certifications = certifications;
  } else {
    const matched = topKEntries(certifications, keywords, 3);
    if (matched.length > 0) sections.certifications = matched;
  }

  return sections;
}

function renderSections(sections) {
  // Compact JSON (no indent) — the model parses it fine and we save ~30% tokens
  // versus pretty-printed output.
  return Object.entries(sections)
    .map(([name, data]) => `${name.toUpperCase()}:\n${JSON.stringify(data)}`)
    .join('\n\n');
}

export function buildSystemPrompt(sessionSummary, latestUserMessage = '') {
  const sections = retrieveContext(latestUserMessage);
  const facts = renderSections(sections);
  return `You are "Soren's Assistant", a concise factual assistant on Soren Larsen's portfolio site.
Your audience is recruiters and hiring managers evaluating Soren's fit.

RULES:
- Answer ONLY from the FACTS below. Do not invent experience, skills, or details.
- If asked about Soren's resume, CV, or for a downloadable version, share the
  URL from CONTACT[0].resumeUrl directly in your response (e.g. "You can view
  his resume here: <url>"). Do NOT redirect resume questions to the Contact
  section — give the link.
- If asked about opinions, preferences, salary, availability, visa, or anything
  else not in FACTS, reply "That's a great question for Soren directly — you
  can reach him via the Contact section."
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

// Per-request token budget. Set so two typical requests within a minute fit
// under Groq's 12k TPM free-tier cap. Worst-case multi-section queries can
// approach this ceiling; the frontend's auto-summarize-then-retry recovers
// when a request would push over it.
export const MAX_PROMPT_TOKENS = 6000;

export const SUMMARIZE_SYSTEM_PROMPT = `You summarize chat conversations on a recruiter-facing portfolio site.
Produce a concise summary (max 3 sentences) of what the visitor asked and what Soren's Assistant said.
Refer to participants as "the visitor" and "Soren's Assistant". Output ONLY the summary text, no preamble.`;
