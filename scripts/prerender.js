#!/usr/bin/env node
/**
 * Injects the site's content into build/index.html as real HTML so crawlers
 * that don't execute JavaScript (LLM bots, ATS scrapers, curl) can read it.
 * React clears #root when it mounts, so this is invisible to real visitors.
 *
 * Source of truth stays src/data/*.json — the same files the components and
 * the chat worker read. Runs after `react-scripts build`.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');
const TARGET = path.join(ROOT, 'build', 'index.html');
const MARKER = '<div id="root"></div>';
const MIN_BYTES = 5000;

const read = (name) => JSON.parse(fs.readFileSync(path.join(DATA, `${name}.json`), 'utf8'));

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// JSON descriptions use \n\n for paragraph breaks and \n for line breaks.
const paras = (text) =>
  String(text)
    .split(/\n{2,}/)
    .map((p) => `<p>${esc(p.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');

const list = (items) => `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;

const dates = (start, end) => (start && end ? `${esc(start)} – ${esc(end)}` : esc(start || end || ''));

const link = (href, text) => `<a href="${esc(href)}">${esc(text)}</a>`;

// Mirrors CATEGORIES in src/components/SkillCard.js, which can't be required
// here (JSX + MUI icon imports). Unknown keys fall back to title case.
const SKILL_LABELS = {
  languages: 'Languages',
  aiLlmSystems: 'AI / LLM Systems',
  frameworks: 'Frameworks',
  dataInfra: 'Data & Infra',
  mlNlpResearch: 'ML / NLP Research',
  developerWorkflows: 'Developer Workflows',
};

// aiLlmSystems -> "Ai Llm Systems"
const titleCase = (key) =>
  key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

const skillLabel = (key) => SKILL_LABELS[key] || titleCase(key);

function build() {
  const [about] = read('about');
  const highlights = read('highlights');
  const [contact] = read('contact');
  const experience = read('experience');
  const projects = read('projects');
  const skills = read('skills');
  const education = read('education');

  const out = [];

  out.push('<h1>Soren Larsen</h1>');
  out.push('<p>AI &amp; Full-Stack Engineer</p>');
  out.push(list(highlights.map((h) => h.text)));

  out.push('<h2>About</h2>');
  out.push(paras(about.about));

  out.push('<h2>Experience</h2>');
  for (const job of experience) {
    out.push(`<h3>${esc(job.title)} — ${job.link ? link(job.link, job.company) : esc(job.company)}</h3>`);
    out.push(`<p>${dates(job.startDate, job.endDate)}${job.location ? ` · ${esc(job.location)}` : ''}</p>`);
    out.push(paras(job.description));
    if (job.skills?.length) out.push(`<p>Skills: ${job.skills.map(esc).join(', ')}</p>`);
  }

  out.push('<h2>Projects</h2>');
  for (const p of projects) {
    out.push(`<h3>${p.link ? link(p.link, p.title) : esc(p.title)}</h3>`);
    if (p.demo) out.push(`<p>${link(p.demo, 'Live demo')}</p>`);
    if (p.video) out.push(`<p>${link(p.video, 'Watch demo')}</p>`);
    if (p.subtitle) out.push(`<p>${esc(p.subtitle)}</p>`);
    out.push(`<p>${dates(p.startDate, p.endDate)}</p>`);
    out.push(paras(p.description));
    if (p.tools?.length) out.push(`<p>Tools: ${p.tools.map(esc).join(', ')}</p>`);
  }

  out.push('<h2>Skills</h2>');
  for (const [category, items] of Object.entries(skills)) {
    out.push(`<h3>${esc(skillLabel(category))}</h3>`);
    out.push(`<p>${items.map((i) => esc(i.name)).join(', ')}</p>`);
  }

  out.push('<h2>Education</h2>');
  for (const e of education) {
    // High school entries carry no degree — lead with the school instead.
    const school = e.link ? link(e.link, e.school) : esc(e.school);
    out.push(`<h3>${e.degree ? `${esc(e.degree)} — ${school}` : school}</h3>`);
    out.push(`<p>${esc(e.dates)}</p>`);
    if (e.description) out.push(paras(e.description));
    if (e.relevantCoursework?.length) out.push(`<p>Coursework: ${e.relevantCoursework.map(esc).join(', ')}</p>`);
  }

  // Phone is deliberately omitted — plain-text phone numbers in scrapable HTML
  // get harvested by spammers. Email and profile links are enough.
  out.push('<h2>Contact</h2>');
  out.push('<ul>');
  if (contact.email) out.push(`<li>${link(`mailto:${contact.email}`, contact.email)}</li>`);
  if (contact.github) out.push(`<li>${link(contact.github, 'GitHub')}</li>`);
  if (contact.linkedin) out.push(`<li>${link(contact.linkedin, 'LinkedIn')}</li>`);
  if (contact.resumeUrl) out.push(`<li>${link(contact.resumeUrl, 'Resume (PDF)')}</li>`);
  out.push('</ul>');

  return out.join('');
}

function main() {
  const html = build();
  if (html.length < MIN_BYTES) {
    throw new Error(
      `prerender produced only ${html.length} bytes (expected >= ${MIN_BYTES}). ` +
        'Did a src/data/*.json file get renamed or emptied?'
    );
  }

  const page = fs.readFileSync(TARGET, 'utf8');
  if (!page.includes(MARKER)) {
    throw new Error(`could not find ${MARKER} in ${TARGET}. Did the CRA build output change?`);
  }

  fs.writeFileSync(TARGET, page.replace(MARKER, `<div id="root">${html}</div>`));
  console.log(`prerender: injected ${html.length} bytes into build/index.html`);
}

if (require.main === module) main();

module.exports = { build, esc, paras, titleCase, skillLabel };
