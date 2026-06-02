---
"@chbrain/khai-review": minor
---

New package: the NLP-review lane, the judged, advisory counterpart to the
deterministic conformance kit. Where a rule can decide it, `@chbrain/khai-tests`
gates it; where only meaning can decide it (conciseness, and later coherence,
voice), this lane reviews it and only ever suggests, never gates.

- `review(prose, rubric, judge)` - a model-free harness; the `judge` is injected
  (a deterministic mock in tests, a model in production), so the package has zero
  model dependencies and stays reproducibly testable.
- `rubrics.conciseness` - the first rubric: "could this be said in fewer words?"
  A word count cannot tell a tight long passage from a padded short one; only a
  reader can, which is exactly why it belongs in this lane and not the kit.
- `reviewCard(manifest, judge)` - run the rubrics over a WIRES card's chapters,
  returning located flags for an advisory PR comment.
- `mockJudge` - a deterministic stand-in that proves the harness wiring; a real
  model-backed judge drops in behind the same interface.
