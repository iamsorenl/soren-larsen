import about from './data/about.json';
import experience from './data/experience.json';
import projects from './data/projects.json';
import skills from './data/skills.json';
import education from './data/education.json';
import certifications from './data/certifications.json';
import highlights from './data/highlights.json';
import contact from './data/contact.json';

// Each section gets keywords that trigger inclusion. ABOUT and CONTACT are
// always included. If no other keywords match, we fall back to a sensible
// default set so the model isn't flying blind on generic openers.
const SECTIONS = {
  about: { data: about, always: true, keywords: [] },
  contact: {
    data: contact,
    always: true,
    keywords: ['contact', 'email', 'reach', 'linkedin', 'github', 'hire', 'recruit'],
  },
  experience: {
    data: experience,
    keywords: [
      'work', 'worked', 'working', 'job', 'role', 'company', 'employ', 'career',
      'internship', 'intern', 'position', 'experience', 'previous', 'currently',
      'recent', 'most recent',
    ],
  },
  projects: {
    data: projects,
    keywords: [
      'project', 'built', 'building', 'build', 'made', 'made', 'created', 'create',
      'repo', 'open source', 'side project', 'app', 'application', 'tool', 'shipped',
    ],
  },
  skills: {
    data: skills,
    keywords: [
      'skill', 'tech', 'technology', 'stack', 'language', 'framework', 'tool',
      'programming', 'know', 'use', 'using', 'proficient', 'familiar', 'expert',
      'python', 'javascript', 'react', 'node', 'java', 'sql', 'go', 'rust',
      'typescript', 'aws', 'docker', 'kubernetes', 'pytorch', 'tensorflow',
      'nlp', 'ml', 'machine learning', 'ai',
    ],
  },
  education: {
    data: education,
    keywords: [
      'school', 'study', 'studied', 'degree', 'university', 'college', 'graduate',
      'graduated', 'major', 'gpa', 'ucsc', 'santa cruz', "master", 'masters',
      'bachelor', 'm.s.', 'b.s.', 'phd', 'coursework', 'academic',
    ],
  },
  certifications: {
    data: certifications,
    keywords: [
      'cert', 'certif', 'license', 'credential', 'aws', 'azure', 'gcp',
      'coursera', 'udemy',
    ],
  },
  highlights: {
    data: highlights,
    keywords: [
      'highlight', 'hobby', 'hobbies', 'interest', 'interests', 'surf', 'surfing',
      'fun', 'outside', 'beyond', 'personal', 'about him',
    ],
  },
};

const DEFAULT_FALLBACK = ['experience', 'highlights'];

export function selectSections(latestUserMessage) {
  const q = (latestUserMessage || '').toLowerCase();
  const selected = new Set();
  for (const [name, meta] of Object.entries(SECTIONS)) {
    if (meta.always) selected.add(name);
  }
  for (const [name, meta] of Object.entries(SECTIONS)) {
    if (meta.always) continue;
    if (meta.keywords.some((kw) => q.includes(kw))) selected.add(name);
  }
  // If nothing beyond the always-included sections matched, add the fallback set.
  const nonAlways = [...selected].filter((n) => !SECTIONS[n].always);
  if (nonAlways.length === 0) {
    for (const name of DEFAULT_FALLBACK) selected.add(name);
  }
  // Preserve a stable canonical ordering for readability.
  return Object.keys(SECTIONS).filter((n) => selected.has(n));
}

function buildFacts(sectionNames) {
  return sectionNames
    .map((name) => `${name.toUpperCase()}:\n${JSON.stringify(SECTIONS[name].data, null, 2)}`)
    .join('\n\n');
}

export function buildSystemPrompt(sessionSummary, latestUserMessage = '') {
  const sections = selectSections(latestUserMessage);
  const facts = buildFacts(sections);
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

export const SUMMARIZE_SYSTEM_PROMPT = `You summarize chat conversations on a recruiter-facing portfolio site.
Produce a concise summary (max 3 sentences) of what the visitor asked and what Soren's Assistant said.
Refer to participants as "the visitor" and "Soren's Assistant". Output ONLY the summary text, no preamble.`;
