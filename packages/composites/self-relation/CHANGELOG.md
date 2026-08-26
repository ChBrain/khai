# @chbrain/khai-composite-self-relation

## 0.1.2

### Patch Changes

- Updated dependencies [8ed7a7a]
  - @chbrain/khai-engine-self-esteem@0.2.0

## 0.1.1

### Patch Changes

- 1776822: Add the self-relation composite -- the ways a persona relates to its own self, read as one weave. A self-relation is not a single dial of self-regard but three modes at once: evaluating its worth (self-esteem), caring for it in suffering (self-compassion), and being true to it (authenticity). The composite authors no mode of its own: it declares the `self-esteem`, `self-compassion`, and `authenticity` engines as dependencies, wires their members by hard package links, and adds only the stance the three compose and the dynamics among them.

  - **Root:** `self-relation` -- the self met along all three modes at once, their particular combination making the persona's overall stance toward itself; the three vary independently and rest on different footings.
  - **Bridges (the drama the atoms cannot stage alone):** `self-relation, modes` (the three held together as one stance, varying independently -- the interesting cases the mismatches, the achiever who cannot be kind to itself), `self-relation, fault` (the modes diverging under failure -- contingent self-esteem collapsing where worth was staked on the success that failed, self-compassion holding because its care needs no success, authenticity forced to own the failure or defend the image -- Crocker & Wolfe; Neff & Vonk; Leary), `self-relation, weave` (the modes enabling or undercutting one another -- self-compassion freeing authenticity, authenticity risking the approval contingent esteem depends on, image-defense corroding both -- Kernis's optimal self-esteem).

  Newly wireable now that `self-compassion` and `authenticity` stand alongside `self-esteem` as engines. The spine is Neff & Vonk's landmark contrast -- self-compassion versus global self-esteem as two different ways of relating to oneself -- extended by authenticity as the third mode. Warranted (LORE, integrative) on Neff & Vonk (2009), Crocker & Wolfe (contingencies of self-worth), Kernis (optimal/secure self-esteem), Leary et al. (self-compassion buffering beyond self-esteem), Kernis & Goldman (authenticity and secure esteem), and Harter (the self-system). Bounded against `identity` (the content of the self vs the stance toward it), the `self-conscious` composite (guilt/shame/pride, the self-evaluative emotions vs the standing modes beneath them), `narcissism` (the disordered grandiose-fragile weave, of which this models the healthy structure), and `self-monitoring` (presentation-tuning vs the inward stance). Set at patch as the free level. No whitelist required -- the `self_relation` root and `self_relation_*` bridge stems are unique.

- Updated dependencies [30a217c]
- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
- Updated dependencies [a0c33f5]
  - @chbrain/khai-engine-authenticity@0.1.1
  - @chbrain/khai-arch@0.1.23
  - @chbrain/khai-engine-self-compassion@0.1.1
