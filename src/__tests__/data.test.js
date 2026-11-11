import projects from '../data/projects.json';
import about from '../data/about.json';
import skills from '../data/skills.json';
import experience from '../data/experience.json';
import contact from '../data/contact.json';
import education from '../data/education.json';
import highlights from '../data/highlights.json';

const fs = require('fs');
const path = require('path');

test('play tab has exactly the four demos in order', () => {
  expect(projects.filter(p => p.tab === 'play').map(p => p.title)).toEqual([
    'SLAC Accelerator Fault Investigator', 'Sentinel: Cyber Incident Response Council', 'StockPulse', 'Ranked AI League']);
});
test('every play project has a demo or video', () => {
  projects.filter(p => p.tab === 'play').forEach(p => expect(p.demo || p.video).toBeTruthy());
});
test('preview files exist and are under 300 KB', () => {
  projects.filter(p => p.preview).forEach(p => [p.preview.poster, p.preview.video].filter(Boolean).forEach(f => {
    const size = fs.statSync(path.join(__dirname, '../../public', f)).size;
    expect(size).toBeLessThanOrEqual(300 * 1024);
  }));
});
test('about has the four approved facts', () => {
  expect(about[0].contractEnd).toMatch(/^He was brought on to take Causality's platform/);
  ['experienceSummary', 'strongestProject', 'now'].forEach(k => expect(about[0][k]).toBeTruthy());
});
test('skills include AWS, Terraform, DynamoDB', () => {
  const names = skills.dataInfra.map(s => s.name);
  ['AWS', 'Terraform', 'DynamoDB'].forEach(n => expect(names).toContain(n));
});
test('no banned names in data', () => {
  expect(JSON.stringify([projects, about, skills, experience, contact, education, highlights])).not.toMatch(/Causality Labs/);
});
