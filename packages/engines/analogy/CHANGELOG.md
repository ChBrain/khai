# @chbrain/khai-engine-analogy

## 0.1.1

### Patch Changes

- b467f39: Add the analogy engine (process: root + forms) -- reasoning by structure-mapping, aligning the relational structure of a known source with a target and carrying inferences across the alignment. The gap analysis (Tier-3 #29) found `framing`/metaphor owns the rhetorical device, but nothing owned the reasoning-and-transfer mechanism beneath a comparison.

  - **Root (process):** `analogy` -- a persona aligns the relations (not the surface features) of a source and target domain and transfers across the alignment; soundness is governed by **systematicity** -- deep, interconnected relations, especially causal ones, over shared surface (Gentner).
  - **Forms (process)** -- Gentner's structure-mapping subprocesses (+ Gick & Holyoak):
    - `retrieval` -- a source analog called to mind from the target, driven notoriously by _surface_ similarity even where sound mapping needs _relational_ similarity (the retrieval-mapping mismatch).
    - `mapping` -- the structural alignment: one-to-one correspondence and parallel connectivity under systematicity.
    - `inference` -- candidate inferences projected across the alignment onto the target as new predictions, held provisionally.
    - `schema` -- the shared relational structure abstracted into a domain-general schema that outlives the pair and eases future transfer (Gick & Holyoak's schema induction).

  **Scope note -- reasoning, not rhetoric.** The persuasive shaping of a claim (including framing _by_ metaphor, to colour rather than to reason) stays with `framing`; the general retrieval of memories stays with `memory` (this engine's retrieval owns only the analog-access step and its surface-vs-structure bias); the psychological-distance abstraction of construal level stays with `construal` (this engine's schema owns _relational_ abstraction). Also distinguished from categorization-by-kind (the sorting of instances into a category vs the mapping of one structured domain onto another).

  Warranted (LORE) on Gentner (1983, "Structure-Mapping" -- the founding, systematicity, structural constraints), Gick & Holyoak (1980/1983 -- transfer failures and schema induction), Holyoak & Thagard (1989 -- mapping as constraint satisfaction), and Falkenhainer, Forbus & Gentner (1989 -- the Structure-Mapping Engine). Set at patch as the free level. No whitelist required -- the `analogy` / `retrieval` / `mapping` / `inference` / `schema` stems are unique.

- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
  - @chbrain/khai-arch@0.1.23
