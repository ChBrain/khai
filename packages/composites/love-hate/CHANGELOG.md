# @chbrain/khai-composite-love-hate

## 0.1.1

### Patch Changes

- dcbccab: Add the love-hate composite (over the `love` + `hate` composites) -- step 3, the capstone of the love/hate rework, and **khai's first composite-of-composites**. It models the ambivalence Freud named: love and hate held toward the same object at once, neither cancelling the other. The `love` composite supplies the love, the `hate` composite supplies the hate, and this composite reads what they make when they run from one object.

  - **Root:** `love-hate` -- the ambivalence of loving and hating one object at once.
  - **Bridges:**
    - `holding` -- love and hate at full toward one object at once (the ambivalent bond, cherished and resented in one motion).
    - `turn` -- the crossing: love curdling to hate (or hate thawing to love), sharpest at a betrayal, since the negation-of-intimacy that hate is built on is love's own intimacy inverted (Sternberg's mirror).
    - `bind` -- the lock: the object mattering too much to leave and hurting too much to hold, approach and avoidance cancelling into paralysis in the closest ties.

  Warranted (LORE) on Freud (ambivalence -- _Totem and Taboo_, _Mourning and Melancholia_, the obsessional cases; Bleuler coined the word), Zeki & Romaya (2008, the shared subcortical circuit that lets one bond hold, cross, and be caught between the two), and Sternberg (the triangular↔duplex mirror by which a betrayed love _converts_ rather than fades). Bounded against its atom composites (`love`/`hate` -- one alone is not ambivalence), general attitudinal ambivalence (a broader future engine), the wider Freud account (a dedicated cluster to come), `attachment` (the approach-avoidance of an insecure bond beneath the feelings), and `grief` (the loss that finally releases an ambivalent tie).

  **First composite-of-composites in the canon:** it declares two composites as dependencies and its hard cross-package links resolve into their members; `validateEnginePackage` confirms the second-order wiring holds. Completes the love/hate rework (`hatred` engine → `hate` composite → this).

- Updated dependencies [ddc66f6]
- Updated dependencies [b7a2f44]
- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
  - @chbrain/khai-composite-hate@0.1.1
  - @chbrain/khai-composite-love@0.1.1
  - @chbrain/khai-arch@0.1.23
