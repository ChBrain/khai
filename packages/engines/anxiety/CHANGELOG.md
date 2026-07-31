# @chbrain/khai-engine-anxiety

## 0.1.1

### Patch Changes

- d2a004c: Add the anxiety engine (multi-type: process, position) -- the diffuse, anticipatory apprehension of an uncertain future threat. Fills a gap the `fear` engine explicitly disclaims at its own boundary: where fear is phasic and cued (a response to an imminent, identified threat), anxiety is sustained and objectless, a bracing for the possible rather than a reaction to the actual, running on a distinct defensive system (the BNST and Gray's behavioral inhibition system, against the amygdala's phasic alarm).

  - **Root (process):** `anxiety` -- readiness against a danger that has no clear object, is not yet present, and may never come; the alarm sustained because the threat is never confirmed enough to fight or flee, nor absent enough to stand down.
  - **Forms (process):** `worry` (the verbal-cognitive stream of future what-ifs that both engages and avoids the feared -- Borkovec), `vigilance` (the hypervigilant scanning, attentional bias toward threat, and readied body -- Gray's BIS), `looming` (the threat appraised as approaching, mounting, closing in -- Riskind; Grupe & Nitschke).
  - **Trait (position):** `intolerance of uncertainty` -- the standing inability to bear the not-knowing, argued to be the core cognitive vulnerability beneath anxiety (Dugas & Ladouceur; Carleton's "fear of the unknown").

  Warranted (LORE) on Barlow (anxious apprehension), LeDoux (defensive circuits vs the assembled feeling), Gray & McNaughton (the BIS), Davis (phasic amygdala fear vs sustained BNST anxiety), Borkovec (worry), Riskind / Grupe & Nitschke (looming / anticipation of uncertain threat), and the intolerance-of-uncertainty literature. Bounded against `fear` (cued phasic threat -- panic/phobia/terror stay there), `stress` (present-stressor mobilization), `rumination` (past-facing brood vs future-facing worry), `apprehension` (the perceptual-attentional baseline), and `hope`'s dread stance (the resting prospect-appraisal vs the live felt state). Set at patch as the free level. No whitelist required -- the `anxiety` root, `worry`/`vigilance`/`looming` form stems, and `uncertainty` trait stem are unique (`dread` and `anxious` were avoided as taken; `panic`/`phobia`/`terror` remain the fear engine's).

- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
  - @chbrain/khai-arch@0.1.23
