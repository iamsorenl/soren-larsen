import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, selectSections, SUMMARIZE_SYSTEM_PROMPT } from '../src/systemPrompt.js';

describe('buildSystemPrompt', () => {
  it('includes the persona header', () => {
    const p = buildSystemPrompt(null);
    expect(p).toContain("Soren's Assistant");
    expect(p).toContain('FACTS');
  });

  it('always includes ABOUT and CONTACT sections regardless of question', () => {
    const p = buildSystemPrompt(null, "What's his most recent role?");
    expect(p).toContain('ABOUT:');
    expect(p).toContain('CONTACT:');
  });

  it('appends summary when provided', () => {
    const p = buildSystemPrompt('Earlier: visitor asked about X.');
    expect(p).toContain('PRIOR CONVERSATION SUMMARY');
    expect(p).toContain('Earlier: visitor asked about X.');
  });

  it('uses "(none)" when no summary provided', () => {
    const p = buildSystemPrompt(null);
    expect(p).toContain('(none)');
  });
});

describe('selectSections', () => {
  it('always returns about and contact', () => {
    const s = selectSections('');
    expect(s).toContain('about');
    expect(s).toContain('contact');
  });

  it('falls back to experience+highlights when no keywords match', () => {
    const s = selectSections('hello there');
    expect(s).toContain('experience');
    expect(s).toContain('highlights');
    expect(s).not.toContain('skills');
    expect(s).not.toContain('education');
  });

  it('selects experience for work-related questions', () => {
    const s = selectSections("What was Soren's most recent role?");
    expect(s).toContain('experience');
    expect(s).not.toContain('education');
  });

  it('selects skills for tech-stack questions', () => {
    const s = selectSections("What's his tech stack?");
    expect(s).toContain('skills');
    expect(s).not.toContain('education');
  });

  it('selects projects for project questions', () => {
    const s = selectSections('What projects has he built?');
    expect(s).toContain('projects');
  });

  it('selects education for academic questions', () => {
    const s = selectSections('Where did he get his masters?');
    expect(s).toContain('education');
  });

  it('selects multiple sections when multiple keywords match', () => {
    const s = selectSections('What projects has he built with his AWS skills?');
    expect(s).toContain('projects');
    expect(s).toContain('skills');
    expect(s).toContain('certifications');
  });
});

describe('SUMMARIZE_SYSTEM_PROMPT', () => {
  it('instructs the model to be concise', () => {
    expect(SUMMARIZE_SYSTEM_PROMPT).toMatch(/concise|short|brief/i);
  });
});
