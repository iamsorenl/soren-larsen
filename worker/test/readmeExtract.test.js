import { describe, it, expect } from 'vitest';
import { extractRelevantSections } from '../src/readmeExtract.js';

const README_WITH_SECTIONS = `
This is the overview paragraph at the top.
It describes the project briefly.

## Installation
Run npm install to get started.

## Architecture
This project uses React and a REST API backend.
The frontend is built with Redux for state management.

## Usage
Run the app with npm start.

## Contributing
Submit pull requests.
`.trim();

describe('extractRelevantSections', () => {
  it('always includes the overview (first section before headings)', () => {
    const result = extractRelevantSections(README_WITH_SECTIONS, 'tell me about the project', 1500);
    expect(result).toContain('This is the overview paragraph');
  });

  it('scores sections against the user question', () => {
    const result = extractRelevantSections(README_WITH_SECTIONS, 'how is the architecture and what React components are used', 1500);
    expect(result).toContain('## Architecture');
    expect(result).toContain('React');
  });

  it('includes high-scoring sections and may omit low-scoring ones when budget is tight', () => {
    // Very tight budget — only overview + one or two sections should fit
    const result = extractRelevantSections(README_WITH_SECTIONS, 'architecture redux', 100);
    expect(result).toContain('This is the overview paragraph');
    // The architecture section scores highest for "architecture redux"
    expect(result).toContain('## Architecture');
    // Contributing should not fit (no relevance + budget tight)
    // We just verify total token estimate <= 100*4=400 chars (rough)
    expect(result.length).toBeLessThanOrEqual(500);
  });

  it('respects the max-token budget', () => {
    const maxTokens = 50; // 50 tokens ~= 200 chars
    const result = extractRelevantSections(README_WITH_SECTIONS, 'project', maxTokens);
    // Token estimate of result should be <= maxTokens
    const estimate = Math.ceil(result.length / 4);
    expect(estimate).toBeLessThanOrEqual(maxTokens);
  });

  it('falls back to hard truncation when no headings present', () => {
    const noHeadings = 'A'.repeat(10000);
    const maxTokens = 100;
    const result = extractRelevantSections(noHeadings, 'question', maxTokens);
    expect(result.length).toBeLessThanOrEqual(maxTokens * 4);
  });

  it('returns empty string for empty input', () => {
    expect(extractRelevantSections('', 'q', 1500)).toBe('');
    expect(extractRelevantSections(null, 'q', 1500)).toBe('');
  });

  it('treats entire content as overview when there are no headings', () => {
    const plain = 'This is plain text without any markdown headings at all.';
    const result = extractRelevantSections(plain, 'text', 1500);
    expect(result).toContain('This is plain text');
  });
});
