# @chbrain/khai-composite-cptsd

## 0.1.2

### Patch Changes

- 8ed7a7a: Point at `self-esteem`'s renamed positions. Link text only; both composites
  read the same atoms and wire the same way.
- Updated dependencies [8ed7a7a]
  - @chbrain/khai-engine-self-esteem@0.2.0

## 0.1.1

### Patch Changes

- f7324c9: Add the cptsd composite (process root + three position movements) -- complex PTSD, the syndrome of prolonged, repeated, inescapable trauma, which carries the whole of core PTSD and adds a pervasive disturbance in the organization of the self. The natural extension of the clinical tier: a composite over the just-shipped `ptsd` engine plus the capacities that sustained trauma deforms.

  - **Root (process):** `cptsd` -- complex PTSD as a self reorganized (not merely wounded) by a trauma it could not escape. Carries all of core PTSD and adds the three ICD-11 disturbances in self-organization. The distinction from single-incident PTSD is duration and entrapment, not degree.
  - **Movements (position)** -- the three disturbances in self-organization, over the core PTSD the `ptsd` atom carries:
    - `dysregulation` -- affect that will not settle: flooding reactivity or numbed shutdown, the `regulation` engine's levers overrun.
    - `diminishment` -- a self-concept collapsed into worthlessness and pervasive shame (`self-esteem` low + `shame`), the trauma's degradation taken as identity.
    - `severance` -- bonds severed or unreachable, trust broken at the root by usually-interpersonal trauma (`attachment` hardened toward avoidant/disorganized).

  **Five atoms, declared as dependencies**, hard-linked by package name so every link resolves through the dependency graph: `ptsd` (core), `regulation`, `self-esteem`, `shame`, `attachment`.

  **Warrant is a lineage, not solo work.** Judith Herman named the syndrome (_Trauma and Recovery_, 1992); the WHO codified it in ICD-11 (core PTSD + the three disturbances); Cloitre and colleagues validated it empirically (the International Trauma Questionnaire; complex PTSD separable from PTSD along exactly those three factors; phase-based repair); van der Kolk anchored the developmental, childhood-onset case. The Origin table credits the tradition, and each atom carries the primary science of its part.

  **Scope note.** Single-incident PTSD and its four clusters stay with the `ptsd` engine (complex PTSD contains and delegates them); the disturbed capacities stay with `regulation`/`self-esteem`/`shame`/`attachment` -- the composite reads only how sustained trauma disturbs them, atop full core PTSD. Ordinary low self-worth or a single regulation failure is not the syndrome. Stems `cptsd`/`dysregulation`/`diminishment`/`severance` are unique -- no whitelist needed.

  **This is authored persona-architecture -- the structure of a complexly traumatized character, for a play -- never a diagnostic instrument for a real person**, and the content says so throughout. It does not diagnose the adjacent syndromes (borderline organization, the dissociative disorders). Set at patch.

- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
- Updated dependencies [471c0b2]
  - @chbrain/khai-arch@0.1.23
  - @chbrain/khai-engine-ptsd@0.1.1
