# @chbrain/khai-engine-defense

## 0.1.1

### Patch Changes

- 7b099d9: Add the defense engine (position: anchor + expressions) -- the unconscious, anxiety-driven distortions of reality by which a persona wards off what it cannot consciously bear, ranked by how much they distort. The gap analysis (Tier-2 #15) found this homeless: the codebase held conscious `regulation` (Gross's strategic emotion moves) and `moral-disengagement` (self-sanction removal) but not the psychodynamic layer of involuntary, out-of-awareness defense.

  - **Anchor (position):** `defense` -- the persona's characteristic level of unconscious, reality-distorting defense against anxiety.
  - **Levels (position) -- Vaillant's maturity hierarchy:**
    - `mature` -- adaptive defenses that keep reality intact (sublimation, suppression, humor, altruism, anticipation).
    - `neurotic` -- intermediate defenses that alter inner experience (repression, reaction-formation, intellectualization, displacement).
    - `immature` -- reality-warping defenses that distort the outer world (projection, denial, acting-out, splitting, fantasy).

  **Design note -- levels as members, mechanisms as prose (no whitelist).** The individual mechanisms are the natural member candidates, but three canonical ones are already owned elsewhere -- `denial` (`mortality`), `suppression` (`regulation`), `displacement` (`moral-disengagement`) -- and breaking them out as members would require a `memberPolicy.homonyms` whitelist (a maintainer/governance change). Instead the engine is structured as a **position over the maturity hierarchy** (`mature`/`neurotic`/`immature`, all stems free), with the individual mechanisms named only as prose examples within each level. This is faithful to the gap row's own framing ("mature→immature maturity hierarchy"), keeps the homonym whitelist untouched, and needs no governance change. If the mechanisms are ever wanted as individual members, that is a separate `governance` PR to whitelist the three colliding stems.

  Warranted (LORE) on Anna Freud (1936, _The Ego and the Mechanisms of Defence_), Vaillant (1977, the defensive-maturity hierarchy), and Cramer (2006, defenses as measurable, developmentally ordered, and distinct from conscious coping). Bounded against `regulation` (the conscious, strategic management of a feeling vs the unconscious warding-off -- the consciousness/intent line), `moral-disengagement` (the exculpation of a moral self vs the warding-off of anxiety), `coping` (the effortful appraisal-driven response vs the automatic distortion -- the classic conscious/unconscious pair), and `mortality` (which owns the specific denial of death, one instance of the general mechanism here). Set at patch as the free level. No whitelist required -- the `defense`/`mature`/`neurotic`/`immature` stems are unique.

- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
  - @chbrain/khai-arch@0.1.23
