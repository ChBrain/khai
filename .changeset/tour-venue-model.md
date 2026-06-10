---
"@chbrain/khai-tour": patch
---

Introduce the interactive Venue model. Venues now carry a `kind`
(`interactive` | `publication`); interactive venues (`claude_project`,
`perplexity_space`) also declare a `source` (`repo` | `upload`). `composeVenue`
is keyed by venue slug (e.g. `perplexity_space`) and resolves the adaption from
spine, with a transition-tolerant fallback to the short folder name until the
spine folders are renamed to the slug. Adds `venuesOfKind(kind)`.
