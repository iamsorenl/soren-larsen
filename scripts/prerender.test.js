#!/usr/bin/env node
/** Self-check for prerender.js: `node scripts/prerender.test.js` */
const assert = require('assert');
const { build, esc, paras, titleCase, skillLabel } = require('./prerender');

// Escaping — this output is injected straight into HTML.
assert.strictEqual(esc('<script>&"'), '&lt;script&gt;&amp;&quot;');
assert.ok(!paras('a <b> & "c"').includes('<b>'), 'paragraph text must be escaped');

// Paragraph splitting on the \n\n convention used in the JSON.
assert.strictEqual(paras('one\n\ntwo'), '<p>one</p><p>two</p>');
assert.strictEqual(paras('one\ntwo'), '<p>one<br>two</p>');

assert.strictEqual(titleCase('aiLlmSystems'), 'Ai Llm Systems');
assert.strictEqual(skillLabel('aiLlmSystems'), 'AI / LLM Systems');
assert.strictEqual(skillLabel('someNewCategory'), 'Some New Category');

// Blank-degree education entries must not render a dangling em dash.
assert.ok(!build().includes('<h3> — '), 'blank degree left a dangling separator');

// Real data: the content crawlers came for must actually be present.
const html = build();
for (const needle of ['Soren Larsen', 'Levangie Laboratories', 'No RAGrets', 'Experience', 'Projects', 'Skills']) {
  assert.ok(html.includes(needle), `missing ${needle}`);
}
assert.ok(html.length > 5000, `too short: ${html.length} bytes`);

// Phone number must never reach scrapable HTML.
assert.ok(!/\d{3}\)?-?\d{3}-\d{4}/.test(html), 'phone number leaked into prerendered HTML');

// Tags must be balanced enough to not break the surrounding document.
assert.strictEqual(
  (html.match(/<p>/g) || []).length,
  (html.match(/<\/p>/g) || []).length,
  'unbalanced <p> tags'
);

console.log(`ok — prerender self-check passed (${html.length} bytes)`);
