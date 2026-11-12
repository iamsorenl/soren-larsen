import about from './data/about.json';
import experience from './data/experience.json';
import projects from './data/projects.json';
import skills from './data/skills.json';
import education from './data/education.json';
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

// Presentation-only fields (media paths, site-local media links) are not facts: keep them out of the prompt and scoring.
const stringifyFacts = (v) =>
  JSON.stringify(v, (k, x) =>
    k === 'preview' || k === 'slides' || k === 'image' ? undefined : k === 'links' && Array.isArray(x) ? x.filter((l) => !l.url.startsWith('/')) : x
  );

function scoreEntry(entry, keywords) {
  if (keywords.length === 0) return 0;
  const text = stringifyFacts(entry).toLowerCase();
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
  education: [
    'school', 'schools', 'university', 'universities', 'college', 'colleges',
    'degree', 'degrees', 'education', 'academic', 'gpa', 'ucsc',
    'santa cruz', 'masters', 'bachelor', 'graduate', 'graduated', 'studied',
    'study', 'coursework', 'course', 'courses', 'class', 'classes', 'master',
  ],
};

function isSectionRelevant(queryLower, sectionName) {
  return SECTION_TOPIC_KEYWORDS[sectionName].some((kw) => queryLower.includes(kw));
}

// Headline-only forms. List-style questions ("what are all his roles?") need
// coverage of every entry, not the full description of every entry — inlining
// all of them costs ~2.2k tokens per section and blows the TPM ceiling on
// tool-calling turns, which make two Groq calls.
function compactExperience(e) {
  return {
    company: e.company,
    title: e.title,
    startDate: e.startDate,
    endDate: e.endDate,
    location: e.location,
  };
}

// `details` is long UI bullet copy that mostly repeats `description`; only
// inline it when a query keyword actually hits it.
// Keys that only drive the site's UI (media, icons, anchors, charts). The
// description already states the numbers a chart shows.
const UI_ONLY_KEYS = ['preview', 'slides', 'press', 'photo', 'muiIcon', 'slug', 'results', 'media', 'diplomaFile'];
const withoutUi = (o) => Object.fromEntries(Object.entries(o).filter(([k]) => !UI_ONLY_KEYS.includes(k)));

function trimDetails(p, keywords) {
  const facts = withoutUi(p);
  if (!facts.details) return facts;
  const d = facts.details.toLowerCase();
  if (keywords.some((kw) => d.includes(kw))) return facts;
  const { details, ...rest } = facts;
  return rest;
}

// "Nov 2024 to Dec 2025", or one date when they match. One short string
// instead of two keys keeps the always-on project list cheap.
const shortDate = (d) => String(d).replace(/^([A-Za-z]{3})[A-Za-z]* (\d{4})$/, '$1 $2');

function compactProject(p) {
  const [start, end] = [shortDate(p.startDate), shortDate(p.endDate)];
  return {
    title: p.title,
    subtitle: p.subtitle,
    dates: start === end ? start : `${start} to ${end}`,
    link: p.link,
  };
}

// Skill levels/proficiency labels drive the UI's progress bars; the model only
// ever needs the names, which costs ~175 tokens instead of ~1120.
function compactSkills(s) {
  return Object.fromEntries(Object.entries(s).map(([k, v]) => [k, v.map((i) => i.name)]));
}

// Retrieves the entries to inline for a given query.
//
// Strategy:
// - about / contact / highlights / education: always included (small);
//   education coursework only when the question is about school.
// - skills: always included, names only.
// - experience: always pin the most recent role in full. If the question
//   topically targets experience ("roles", "work history", etc.), every other
//   role is included in headline-only form so list-style questions still see
//   the complete set; the best keyword match is kept in full.
// - projects: same treatment when topically targeted; otherwise fall back to
//   entry-level top-K matches (or omit if nothing scores).
export function retrieveContext(latestUserMessage) {
  const queryLower = (latestUserMessage || '').toLowerCase();
  const keywords = extractKeywords(latestUserMessage);
  const sections = {};

  sections.about = about;
  sections.contact = contact;
  sections.highlights = highlights;
  sections.skills = compactSkills(skills);
  // Coursework lists only ride along when the question is about school.
  const eduRelevant = isSectionRelevant(queryLower, 'education');
  sections.education = education.map((e) => {
    const facts = withoutUi(e);
    if (!eduRelevant) delete facts.relevantCoursework;
    return facts;
  });

  if (isSectionRelevant(queryLower, 'experience')) {
    // Full detail for the current role plus the best keyword match; every other
    // role in headline form so "list all his jobs" still has complete coverage.
    const detailed = new Set([experience[0], ...topKEntries(experience.slice(1), keywords, 1)]);
    sections.experience = experience.map((e) => (detailed.has(e) ? e : compactExperience(e)));
  } else {
    const recentExperience = experience.slice(0, 1);
    const matchedExperience = topKEntries(experience.slice(1), keywords, 2);
    sections.experience = [...recentExperience, ...matchedExperience];
  }

  if (isSectionRelevant(queryLower, 'projects')) {
    const detailed = new Set(topKEntries(projects, keywords, 2));
    sections.projects = projects.map((p) => (detailed.has(p) ? trimDetails(p, keywords) : compactProject(p)));
  } else {
    const matched = topKEntries(projects, keywords, 3).map((p) => trimDetails(p, keywords));
    if (matched.length > 0) sections.projects = matched;
  }

  return sections;
}

function renderSections(sections) {
  // Compact JSON (no indent) — the model parses it fine and we save ~30% tokens
  // versus pretty-printed output.
  return Object.entries(sections)
    .map(([name, data]) => `${name.toUpperCase()}:\n${stringifyFacts(data)}`)
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
- ABOUT[0] has his location, what roles he's looking for, and his
  availability. Answer those questions directly from it.
- ABOUT[0] also has contractEnd, experienceSummary, strongestProject and now. Use
  them for why the last contract ended, years of experience and level, his
  strongest project, and what he is working on.
- If asked about salary, visa or work authorization, personal opinions, or
  anything else not in FACTS, call show_contact and write no text before or
  after the call; the contact card says to ask Soren directly. Never state a
  salary or work authorization status.
- Call show_contact when asked how to reach him or for links.
- Call open_demo when asked to see something he built.
- Call go_to_section when asked where something is on the page.
- Call leave_note when the visitor wants to message him.
- Never mention tool names to the visitor.
- If a question is partially answerable, answer what you can and redirect for the rest.
- Refer to Soren in third person ("Soren", "he"). Never speak as Soren.
- Keep answers under 4 sentences unless asked for detail. No marketing fluff.
- When listing projects or roles, give names with a few words each. Leave out
  URLs unless the visitor asks for links.
- Write plain text. The chat shows raw characters, so no markdown: no **bold**,
  no headings, no tables. For a list, put each item on its own line starting
  with "- ".
- When calling a tool that takes a URL or other identifier from FACTS, copy the
  value VERBATIM from the matching FACTS entry. Never construct, guess, or
  pattern-match URLs — owners and repo names are not predictable from titles.

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

// Per-request token budget. A tool-calling turn makes TWO Groq calls within the
// same minute, so this must stay under half of the free-tier TPM cap — which
// dropped from 12k to 8k when llama-3.3-70b-versatile was decommissioned on
// 2026-08-16 (gpt-oss-120b, gpt-oss-20b and qwen3-27b are all 8k). Worst-case
// multi-section queries can approach this ceiling; the frontend's
// auto-summarize-then-retry recovers when a request would push over it.
export const MAX_PROMPT_TOKENS = 3800;

export const SUMMARIZE_SYSTEM_PROMPT = `You summarize chat conversations on a recruiter-facing portfolio site.
Produce a concise summary (max 3 sentences) of what the visitor asked and what Soren's Assistant said.
Refer to participants as "the visitor" and "Soren's Assistant". Output ONLY the summary text, no preamble.`;
