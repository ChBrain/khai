# @chbrain/khai-engine-possible-selves

## 0.1.1

### Patch Changes

- ea1fe61: Add the possible-selves engine (position: anchor + expressions) -- the future-oriented components of a persona's self-concept, the cognitive representations of what it could become. The gap analysis (Tier-1 #9) found this homeless in the seam between `identity` (which holds the present self-story) and `goal` (which pursues an end-state, not a self-image): neither models the self projected forward, the bridge between self-concept and motivation that Markus & Nurius named.

  - **Anchor (position):** `possible-selves` -- the repertoire of future self-representations, the pull and push the future exerts on the present.
  - **Standings (position):**
    - `hoped` -- the desired future self, what the persona would like to become, drawing effort toward it.
    - `feared` -- the dreaded future self, what it is afraid of becoming, pushing effort away; often the sharper motivator, strongest paired with its hope.
    - `expected` -- the probable self, what it realistically anticipates becoming, the reality anchor between hope and fear.
    - `lost` -- the relinquished self, a once-live future given up, carried as a branch of identity; its letting-go a mark of maturity (King's lost possible selves).

  Warranted (LORE) on Markus & Nurius (the founding -- possible selves as the link between self-concept and motivation; the hoped-for, feared, and expected selves), Oyserman (identity-based motivation -- balance between hoped and feared, identity congruence, and strategy linkage that makes a possible self regulate behavior), King (lost possible selves and the maturity in relinquishing them), and Markus & Ruvolo (possible selves as personalized representations of goals). Bounded against `identity` (the present self-story vs the future projection), `self-discrepancy` (the present gap between the actual self and its ideal/ought guides vs the temporally forward self), `goal` (the end-state pursued vs the self-relevant picture that personalizes it), and `regret` (the counterfactual emotion over a past choice vs the foreclosed future self it may attach to). Set at patch as the free level. No whitelist required -- the `possible_selves` anchor stem and the `hoped`/`feared`/`expected`/`lost` standing stems are unique; `ideal` and `ought` are deliberately left free for the forthcoming self-discrepancy engine.

- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
  - @chbrain/khai-arch@0.1.23
