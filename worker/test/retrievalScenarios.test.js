// End-to-end retrieval scenarios — runs the real `retrieveContext` and
// `buildSystemPrompt` against the real synced JSON data to make sure realistic
// recruiter questions surface sensible entries. Complements the granular unit
// tests in systemPrompt.test.js.

import { describe, it, expect } from 'vitest';
import {
  retrieveContext,
  buildSystemPrompt,
  estimateTokens,
  MAX_PROMPT_TOKENS,
} from '../src/systemPrompt.js';

function companies(experience) {
  return experience.map((e) => e.company);
}

function projectTitles(projects) {
  return projects.map((p) => p.title);
}

describe('experience retrieval', () => {
  it('"most recent role" pins Levangie Laboratories', () => {
    const sections = retrieveContext("What was Soren's most recent role?");
    expect(companies(sections.experience)).toContain('Levangie Laboratories');
  });

  it('"what other roles has he had" returns more than just Levangie', () => {
    const sections = retrieveContext('What other roles has he had?');
    const cos = companies(sections.experience);
    expect(cos).toContain('Levangie Laboratories');
    expect(cos.length).toBeGreaterThanOrEqual(3);
  });

  it('"list ALL his jobs" returns every experience entry', () => {
    const sections = retrieveContext('List ALL his jobs');
    const cos = companies(sections.experience);
    expect(cos).toEqual(
      expect.arrayContaining([
        'Levangie Laboratories',
        'Gray Whale',
        'Onda Sports Inc.',
        'Baskin Engineering at UCSC',
        'Boardal',
      ])
    );
  });

  it('"what did he do at Gray Whale" surfaces the Gray Whale entry', () => {
    const sections = retrieveContext('What did Soren do at Gray Whale?');
    expect(companies(sections.experience)).toContain('Gray Whale');
  });

  it('"tell me about Onda" surfaces the Onda Sports entry', () => {
    const sections = retrieveContext('Tell me about Onda Sports.');
    expect(companies(sections.experience)).toContain('Onda Sports Inc.');
  });

  it('"any internships?" pulls multiple entries since "intern" is a topic word', () => {
    const sections = retrieveContext('Has he had any internships?');
    expect(sections.experience.length).toBeGreaterThanOrEqual(2);
  });
});

describe('projects retrieval', () => {
  it('"what projects has he worked on" returns more than one project', () => {
    const sections = retrieveContext('What projects has he worked on?');
    expect(Array.isArray(sections.projects)).toBe(true);
    expect(sections.projects.length).toBeGreaterThan(1);
  });

  it('"tell me about No RAGrets" surfaces No RAGrets specifically', () => {
    const sections = retrieveContext('Tell me about No RAGrets.');
    expect(projectTitles(sections.projects ?? [])).toContain('No RAGrets');
  });

  it('"his NLP projects" surfaces NLP-flavored entries', () => {
    const sections = retrieveContext('What are his NLP projects?');
    expect(sections.projects.length).toBeGreaterThan(0);
    // The data set has several NLP-tagged projects — at least one of these
    // is expected to appear.
    const titles = projectTitles(sections.projects);
    const nlpHits = titles.filter((t) =>
      ['No RAGrets', 'UCSC RAG Chatbot', 'BiLSTM-CRF for Named Entity Recognition'].includes(t)
    );
    expect(nlpHits.length).toBeGreaterThan(0);
  });

  it('out-of-domain question does not include projects via topic-relevance', () => {
    const sections = retrieveContext("What's his favorite ice cream flavor?");
    // Either omitted entirely, or a small entry-level top-K — never the full
    // list of 8 projects.
    if (sections.projects) {
      expect(sections.projects.length).toBeLessThanOrEqual(3);
    }
  });
});

describe('always-included sections', () => {
  it('about / contact / skills / highlights / education are present regardless of query', () => {
    for (const q of [
      "What's his most recent role?",
      'Tell me about his projects.',
      "What's his favorite color?",
      '',
    ]) {
      const s = retrieveContext(q);
      expect(s.about).toBeDefined();
      expect(s.contact).toBeDefined();
      expect(s.skills).toBeDefined();
      expect(s.highlights).toBeDefined();
      expect(s.education).toBeDefined();
    }
  });
});

describe('education retrieval', () => {
  it('"where did he study" includes education content', () => {
    const sections = retrieveContext('Where did he study?');
    expect(sections.education).toBeDefined();
  });

  it('"what degrees does he have" includes education content', () => {
    const sections = retrieveContext('What degrees does he have?');
    expect(sections.education).toBeDefined();
  });
});

describe('certifications retrieval', () => {
  it('"what certifications has he earned" includes the certifications section', () => {
    const sections = retrieveContext('What certifications has he earned?');
    expect(sections.certifications).toBeDefined();
  });

  it('out-of-topic question omits certifications', () => {
    const sections = retrieveContext("What was Soren's most recent role?");
    expect(sections.certifications).toBeUndefined();
  });
});

describe('prompt token budget', () => {
  const RECRUITER_QUERIES = [
    "What was Soren's most recent role?",
    'What other roles has he had?',
    'List ALL his jobs',
    'What projects has he worked on?',
    'Has he used Python in any of his work?',
    'Where did he study?',
    'What certifications has he earned?',
    'Tell me about No RAGrets.',
    'What is his tech stack?',
    'How can I get in touch with him?',
  ];

  for (const q of RECRUITER_QUERIES) {
    it(`stays under MAX_PROMPT_TOKENS for: "${q}"`, () => {
      const tokens = estimateTokens(buildSystemPrompt(null, q));
      expect(tokens).toBeLessThan(MAX_PROMPT_TOKENS);
    });
  }

  it('worst-case multi-section query stays under MAX_PROMPT_TOKENS', () => {
    const tokens = estimateTokens(
      buildSystemPrompt(null, 'Tell me about all his jobs and projects and certifications and education.')
    );
    expect(tokens).toBeLessThan(MAX_PROMPT_TOKENS);
  });
});

describe('summary handling', () => {
  it('renders the provided summary in the prompt', () => {
    const p = buildSystemPrompt('Earlier the visitor asked about X.', 'follow-up question');
    expect(p).toContain('Earlier the visitor asked about X.');
  });
});
