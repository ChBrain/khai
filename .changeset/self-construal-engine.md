---
"@chbrain/khai-engine-self-construal": patch
---

Add the self-construal engine (position: anchor + expressions) -- a persona's resting sense of where its self is bounded, as a separate autonomous individual or as a connected self defined through its ties. The gap analysis (Tier-2 #13) found this homeless: the codebase had no representation of the independent/interdependent self-boundary that organizes cognition, emotion, and motivation across cultural contexts, and the `construal` engine occupies the shared word only in the unrelated Construal-Level Theory sense.

- **Anchor (position):** `self-construal` -- the default weighting of I against we a persona brings before any relationship or situation.
- **Construals (position):**
  - `independent` -- the self as a bounded, autonomous unit defined from within (own traits, values, preferences), stable across contexts, realized by expressing and asserting, worth sourced in standing out and being consistent.
  - `interdependent` -- the self as fundamentally connected, defined through its relationships, roles, and groups, contextual and flexible, realized by fitting in and adjusting, worth sourced in belonging and harmony.

Warranted (LORE) on Markus & Kitayama (1991, the founding -- the two construals and their reach across cognition/emotion/motivation), Triandis (individualism-collectivism; idiocentrism/allocentrism), and Singelis (the two as separable dimensions a person can hold jointly, so the self-boundary is a weighting rather than a strict either/or, and can be situationally primed). Bounded against `construal` (Construal-Level Theory -- the abstraction of a representation by psychological distance, a different construct sharing only the word, kept strictly apart -- no member-stem overlap: `independent`/`interdependent` vs `abstraction`/`concreteness`/`traversal`), `social-identity` (the identification with a specific group vs the prior general self-boundary), `identity` (the present self-story), `self-esteem` (where worth is sourced vs the worth itself), and `tightness-looseness` (the culture's norm strength vs the individual's self-boundary -- the two form a culture cluster). Set at patch as the free level. No whitelist required -- the `self_construal`/`independent`/`interdependent` stems are unique.
