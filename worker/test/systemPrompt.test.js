import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, SUMMARIZE_SYSTEM_PROMPT } from '../src/systemPrompt.js';

describe('buildSystemPrompt', () => {
  it('includes the persona header', () => {
    const p = buildSystemPrompt(null);
    expect(p).toContain("Soren's Assistant");
    expect(p).toContain('FACTS');
  });

  it('embeds JSON data sections', () => {
    const p = buildSystemPrompt(null);
    expect(p.toLowerCase()).toContain('about');
    expect(p.toLowerCase()).toContain('experience');
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

describe('SUMMARIZE_SYSTEM_PROMPT', () => {
  it('instructs the model to be concise', () => {
    expect(SUMMARIZE_SYSTEM_PROMPT).toMatch(/concise|short|brief/i);
  });
});
