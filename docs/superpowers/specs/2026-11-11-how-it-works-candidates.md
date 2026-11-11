# How it works: candidate visuals (Task 11, Step 1 recon)

Date: 2026-11-11. Recon only. Nothing built; the tab stays hidden.
Method: shallow clones of Soren's public repos (`gh repo list iamsorenl`), commit authors and `git blame` per file, plus a read of the arcade-soccer AI and Elo code. The private `Natural-Language-Processing` repo (the course assignments) was not opened; the public per-assignment repos cover the same work.

## Authorship summary

| Repo | Commits | Soren's own code | Not his |
|---|---|---|---|
| `minllama-assignment` (the transformer) | `snlarsen` 13 (his UCSC GPU-server login), `Soren Larsen` 1, rest are CMU/UCSC course staff (Vijay Viswanathan 36, Graham Neubig 6, others) | `git blame` on `llama.py`: 114 lines `snlarsen` vs 269 Viswanathan. `rope.py`: 26 vs 70. Also `optimizer.py` and `classifier.py` edits | **Forked from CMU's instructor starter repo.** Skeleton, docstrings, `structure.md`, tokenizer, `run_llama.py`, tests, data are instructor code. He filled in the TODOs (RMSNorm `_norm`, scaled dot-product attention, forward passes, SwiGLU, RoPE, `generate` with temperature/top-k/top-p/repetition penalty, AdamW step, classification head) |
| `HMM-POS-Tagger` | all 11 by `Soren Larsen` | `hmm_tagger.py` (350 lines): Viterbi, add-alpha smoothing, counts, baseline | `starter_code.py` (instructor evaluation helper) and the Penn Treebank sample data |
| `arcade-soccer` | all 53 by `Soren Larsen` | `js/ai.js`, `js/elo.js`, `js/engine.js`, `js/team.js`, tests | none flagged (no team or instructor code; no dependencies) |
| `ngram_project`, `bilstm-crf-character-cnn-ner`, `Neural-Machine-Translation`, `Transformer_QA` | Soren only (`Transformer_QA` and NMT also have `snlarsen`) | not inspected in depth | NMT vendors `mosesdecoder` and fairseq-style scripts; skip it |

Flag: the "transformer he wrote himself" is a fill-in-the-blanks assignment on instructor scaffolding. Copy on the site should say "implemented the core pieces of a minimal Llama", not "wrote a transformer from scratch". Also, the visuals below should re-implement the math in plain JS rather than ship instructor files.

## Candidate A: Inside the transformer (attention + sampling)

What a visitor sees: a short sentence split into tokens. Click a token to see its attention row as a heat strip over the other tokens (causal mask shown as greyed cells). Step through the pipeline: RMSNorm, scaled QK^T/sqrt(d), softmax, weighted sum of V. Second panel: a hand-set next-token distribution with sliders for temperature, top-k and top-p; bars reshape live and a "sample" button draws a token.

Built from: `iamsorenl/minllama-assignment` `llama.py` (`_norm`, `compute_query_key_value_scores`, `generate`) and `rope.py`. Pipeline order and formulas come from his code; the JS is a fresh port.

Own code? Partly. Evidence: blame lines above, commits "forward", "_norm", "rope", "generate" by `snlarsen`. Scaffold is instructor code (flag above).

Data: must be hand-authored toy numbers (small Q/K/V vectors, a made-up 6-word logit table), labeled "illustrative, not real model output". The model weights (`stories42M.pt`) are not in the repo and would be too heavy anyway. Do not show any accuracy; the README's SST and CFIMDB numbers exist but are a different story and not needed here.

Effort: M. Pure vanilla JS or small React component, no ML runtime. The work is authoring a toy example that is correct and readable.

Risks: overclaiming authorship (see flag); toy numbers could be mistaken for real model behavior, so label them; mobile layout for an attention grid at 390px.

## Candidate B: Tagging a sentence with Viterbi (HMM POS tagger)

What a visitor sees: type or pick a short sentence. A trellis (words across, POS tags down) fills in column by column with log-probabilities; the best path is traced back and highlighted. A slider for the smoothing alpha changes unseen-word behavior.

Built from: `iamsorenl/HMM-POS-Tagger` `hmm_tagger.py` (`viterbi`, `compute_transition_probabilities`, `compute_emission_probabilities`, `calculate_counts`).

Own code? Yes: all 11 commits by Soren; only `starter_code.py` (evaluation helper) and the treebank data are course-provided. Cleanest authorship of the three.

Data: ship a tiny tag set (about 6 tags) with probabilities computed offline from the sample Penn Treebank files in the repo, or a hand-built toy table clearly labeled. Never quote the repo's accuracy unless re-read from its README/confusion matrix at build time. (Penn Treebank licensing: use derived counts only, not raw text.)

Effort: S to M. The Viterbi is about 50 lines; the trellis UI is the work.

Risks: HMM taggers are dated, so it reads as "classical NLP" rather than current; best as a companion to A. Treebank-derived counts need a quick licence sanity check.

## Candidate C: AI League, how the AI and ranking work

What a visitor sees: two panels. (1) Ranking: two teams with Elo sliders; shows win probability and the exact rating change for win/draw/loss (K = 32, zero-sum). A "run 20 matches" button replays a series with a seeded random draw and shows ratings converging. (2) The AI: a top-down pitch with a few players; toggle "has the ball / press / anchor shift" to show how each AI player picks a role (anchor slide toward ball, shot range, through-pass gain). Team Builder sliders under an 80-point budget are explained as "config, not code".

Built from: `iamsorenl/arcade-soccer` `js/elo.js` (20 lines, imports directly), `js/ai.js` (`DEFAULT_TEAM_CONFIG`, `updateTeam`, `updateCarrier`), `js/engine.js`, `js/team.js`; design intent in `docs/superpowers/specs/2026-07-13-ai-league-design.md`. Tests: `test/elo.test.mjs`, `test/determinism.test.mjs`.

Own code? Yes, 53/53 commits by Soren; vanilla JS, no dependencies, no team code.

Data: none invented. Elo math is exact; the "20 matches" demo is a simulation labeled as such, not league results. Do not show real leaderboard numbers unless fetched live from the league.

Effort: S for the Elo panel (reuse `elo.js` as is); M to L for the AI pitch panel (engine state is coupled to `state`, `config.js`, `actions.js`; a trimmed embed or a link to the existing Watch mode is cheaper). Spec calls this the later "How it works" for the Ranked AI League tile, so ship the Elo panel first and link to Watch mode for the AI half.

Risks: embedding the engine pulls in many modules; the AI is rule-based, not learned, so copy should say "rule-based AI tuned by weights", not "machine learning". League is self-hosted (Funnel); the visual must work with no backend.

## Recommendation

Build first: A (transformer) for the "NLP coursework" spec line, and the Elo half of C for the Ranked AI League tile (smallest, cleanest, fully his code). Hold B as the cheap follow-up if a second NLP visual is wanted; it has the best authorship story. Whatever ships, word A as "implemented the core pieces of a minimal Llama (attention, RoPE, sampling) on CMU/UCSC starter code".
