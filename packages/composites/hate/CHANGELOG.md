# @chbrain/khai-composite-hate

## 0.1.1

### Patch Changes

- ddc66f6: Add the hate composite (over `disgust` + `anger` + `contempt`) -- step 2 of reworking hate to structurally mirror the `love` composite. Where `love` wires Sternberg's triangle (intimacy←self-disclosure, passion←desire, commitment←loyalty), `hate` wires his **duplex** theory, its deliberate mirror: negation-of-intimacy←`disgust`, passion←`anger`, commitment-to-devaluation←`contempt`. The warrant is not only the conceptual parallel but the neuroscience -- Zeki & Romaya (2008) find love and hate share a common subcortical circuit (putamen, insula), so building hate as love's twin follows the brain.

  - **Root:** `hate` -- the composition of a hate, which of the three components it is made of and how they harden.
  - **Bridges (the two-cornered hates, Sternberg's duplex types):**
    - `boiling` -- negation of intimacy + passion (disgust + anger): hot revulsion, the loathing that recoils and rages at once, not yet fixed.
    - `seething` -- negation of intimacy + commitment (disgust + contempt): cold, settled revilement, the target kept at a distance and fixed as beneath regard, durable and essentializing.
    - `burning` -- passion + commitment (anger + contempt): the devaluing fury that leans in, the drive to annihilate a target held worthless.
    - All three at once = the consummate hate (the burning need for annihilation).

  Warranted (LORE) on Sternberg (2003, the duplex theory), Zeki & Romaya (2008, the shared neural circuit), Fischer et al. (2018, the emergent durable/essentializing sentiment the corners make together), and Staub/Haslam (escalation via essentialism). Bounded against its own atoms as single corners (`anger` = passing fury, `disgust` = revulsion, `contempt` = cold dismissal -- none alone is hate), and against `aggression` (the harm the hate motivates) and `moral-disengagement` (the licensing of that harm). Replaces the standalone `hatred` engine removed in the prior PR. The `love-hate` composite (over `love` + `hate`) follows.

- Updated dependencies [03a3b88]
- Updated dependencies [4a05b85]
- Updated dependencies [b53ee6c]
- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
  - @chbrain/khai-engine-anger@0.1.1
  - @chbrain/khai-engine-contempt@0.1.1
  - @chbrain/khai-engine-disgust@0.1.1
  - @chbrain/khai-arch@0.1.23
