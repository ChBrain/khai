# @chbrain/khai-engine-categorization

## 0.1.1

### Patch Changes

- 224653d: Add the categorization engine (process: root + forms) -- the sorting of instances into kinds and the forming of the kinds themselves. The gap analysis (Tier-3 #30) found `representativeness` _uses_ categories (to judge probability by similarity), but nothing owned their formation and structure.

  - **Root (process):** `categorization` -- Rosch's findings set its character: membership is **graded**, not all-or-none (a robin is a better bird than a penguin -- typicality); categories cohere by **family resemblance** (overlapping features, not necessary-and-sufficient definitions); and they settle at a privileged **basic level** (chair, between furniture and kitchen-chair -- most informative, first learned, fastest named). Membership turns on similarity and coherence, not a checklist of defining features.
  - **Forms (process)** -- Murphy's three views of how membership is decided:
    - `prototype` -- by similarity to an abstracted central tendency; economical but blind to the individual case (Rosch; Posner & Keele).
    - `exemplar` -- by summed similarity to stored individual instances; sensitive to variability and exceptions (Medin & Schaffer; Nosofsky's GCM).
    - `theory` -- by fit to an intuitive causal/explanatory account of why the features cohere; deep and surface-robust but only as good as the theory (Murphy & Medin).

  The bases are not exclusive -- a persona may judge a clear case by prototype, a borderline one by exemplar, a puzzling one by theory.

  **Scope note -- the structure of categories, not their use.** The heuristic that judges probability by category similarity (neglecting base rates) stays with `representativeness`; the social category imposed on a person as a type stays with `bias`'s stereotype member; the cross-domain mapping of relational structure stays with `analogy`; and the single vivid instance deployed to persuade stays with `framing`'s exemplar (same word, two jobs -- the cognitive basis here, the rhetorical device there; the form file is `process_exemplars.md`, stem `exemplars`, distinct from `framing`'s `exemplar`).

  Warranted (LORE) on Rosch (1978, "Principles of Categorization"; 1973 -- graded membership, family resemblance, the basic level), Murphy (2002, _The Big Book of Concepts_ -- the prototype/exemplar/theory synthesis), Medin & Schaffer (1978) and Nosofsky (1986, the generalized context model -- the exemplar view), and Murphy & Medin (1985, "The Role of Theories in Conceptual Coherence" -- the theory view). Set at patch as the free level. No whitelist required -- the `categorization` / `prototype` / `exemplars` / `theory` stems are unique.

- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
  - @chbrain/khai-arch@0.1.23
