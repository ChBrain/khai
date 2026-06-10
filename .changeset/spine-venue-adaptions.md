---
"@chbrain/khai-engine-spine": patch
---

Ship the Venue adaptions and shared House Rules as spine content, exposed for the
Roadie. Add `house-rules.md` (the shared runtime-output discipline merged into
every deployed System) and `perplexity/adaption.md` (the Perplexity-specific
delta), and export `houseRules` + `adaptions` from `index.mjs`. They are markdown
fragments, not khai instances: spine ships them, the Roadie (khai-tour) parses
and merges. Woven into the setup plan.
