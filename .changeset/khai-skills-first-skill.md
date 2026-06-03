---
"@chbrain/khai-skills": minor
---

Add `@chbrain/khai-skills`: portable, vendor-neutral Agent Skills built from the
khai-arch canon so cheaper or non-code-aware models can do khai work to the
agentskills.io open standard. Composes each skill by pulling templates from
canon at build time (`build:skills`), emits a deterministic per-skill zip, and
guards it in pure Node across two tiers (Tier 1 standard conformance; Tier 2 khai
policy: vendor neutrality + canon provenance). Pins the official PyPI
`skills-ref` validator version plus the spec content hash, with a lazy upstream
drift check that surfaces a move order on the next touch of any skill. First
skill: `creating-a-play` (the `play` house type, ENACTS).
