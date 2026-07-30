---
"@chbrain/khai-engine-self-discrepancy": patch
---

Add the self-discrepancy engine (multi-type: process, position) -- the gap a persona feels between its actual self and a self-guide it is measured against, and the specific affect that gap produces. The gap analysis (Tier-1 #10) found this homeless: the codebase held the pursuit orientation (`regulatory-focus`, Higgins's later theory) but not Higgins's founding self-discrepancy theory, whose central claim is that different self-guide gaps produce different emotions.

- **Root (process):** `self-discrepancy` -- the comparison of the actual self against a self-guide, and the affect of the gap.
- **Forms (process):**
  - `ideal` -- the actual:ideal discrepancy, the persona short of the self it hoped to be (a positive outcome absent), which brings **dejection** (sadness, disappointment, discouragement).
  - `ought` -- the actual:ought discrepancy, the persona short of the self it is bound to be (a negative outcome present, a threat), which brings **agitation** (anxiety, guilt, self-reproach).
- **Trait (position):** `discrepant` -- the standing profile: how large and accessible a persona's discrepancies chronically are, and whether the ideal or the ought guide dominates its self-evaluation (Higgins's chronic accessibility).

Warranted (LORE) on Higgins (1987, _Self-Discrepancy: A Theory Relating Self and Affect_) and the empirical dissociation of ideal-discrepancy-to-dejection and ought-discrepancy-to-agitation. Bounded against `regulatory-focus` (the promotion/prevention pursuit style vs the self-guide gap -- same author, same ideal/ought vocabulary, distinct theory), `sadness` (which owns the dejection emotions this engine's ideal form produces), `anxiety`/`guilt` (which own the agitation emotions the ought form produces), `self-esteem` (the global self-worth vs the guide-relative gap), `identity` (the present self-story), and `possible-selves` (the future selves that can supply an ideal guide's content vs the present measurement against it). Set at patch as the free level. No whitelist required -- the `self_discrepancy`/`ideal`/`ought`/`discrepant` stems are unique (`promotion`/`prevention` remain regulatory-focus's; `ideal` and `ought` were left free by possible-selves precisely for this engine).
