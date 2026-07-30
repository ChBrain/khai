---
"@chbrain/khai-engine-self-handicapping": patch
---

Add the self-handicapping engine (multi-type: process, position) -- erecting an obstacle before an evaluative outcome so that a failure can be attributed to the obstacle rather than to ability, and a success counts double for coming despite it. The gap analysis (Tier-2 #18) found this homeless: the codebase held the after-the-fact self-serving attribution (the `bias` engine's self-serving member) but not the anticipatory, behavioral strategy Berglas & Jones named -- the impediment put in place before the outcome, often at the real cost of the performance.

- **Root (process):** `self-handicapping` -- the pre-emptive obstacle that discounts a failure (external cause, not lack of ability) and augments a success (won despite the burden).
- **Forms (process):**
  - `acquired` -- a real obstacle created (withdrawing effort, procrastinating, undertraining, a substance), genuinely impairing the performance; the costly, stronger cover.
  - `claimed` -- an impediment merely asserted (illness, anxiety, stress reported in advance) without degrading the performance; the cheaper, weaker cover.
- **Trait (position):** `handicapper` -- a standing readiness to reach for a handicap under evaluative threat, highest where ability is prized and uncertain (Rhodewalt's Self-Handicapping Scale).

Warranted (LORE) on Berglas & Jones (1978, the founding drug-choice study), Leary & Shepperd (1986, the behavioral-vs-claimed distinction), Rhodewalt (the Self-Handicapping Scale and the discounting/augmentation logic), and Jones & Berglas (1978, the attributional account). Bounded against the `bias` engine's self-serving member (the _after_-the-fact attribution vs this _before_-the-fact obstacle), the `repair` engine's excuse (the post-hoc account for a completed act vs the pre-emptive cover), `self-efficacy` (the belief in ability vs the defense of the ability-image), and `self-esteem` (the worth defended vs the defending). Set at patch as the free level. No whitelist required -- the `self_handicapping`/`acquired`/`claimed`/`handicapper` stems are unique.
