---
"@chbrain/khai-engine-tightness-looseness": patch
---

Add the tightness-looseness engine (position: anchor + expressions) -- the strength of the social norms a persona lives under and the latitude its world grants for deviance. The gap analysis (Tier-2 #14) found this homeless: the codebase held the persona's yielding to a norm (`conformity`) and to an authority (`obedience`) but not the system property upstream of yielding -- how strong the norms are and how much a world tolerates a step out of them.

- **Anchor (position):** `tightness-looseness` -- the standing severity of the norm field, set before anyone conforms or refuses.
- **Regimes (position):**
  - `tight` -- strong norms, narrow latitude: clear rules strongly enforced, pervasive monitoring and swift sanction, high situational constraint met with more self-regulation; order and coordination bought at the cost of openness.
  - `loose` -- weak norms, wide latitude: few or weakly enforced rules, high tolerance for deviance, little monitoring, room to improvise; openness and variety bought at the cost of order.

Warranted (LORE) on Gelfand et al. (2011, the 33-nation Science study establishing cultural tightness-looseness as norm strength and sanctioning severity, distinct from individualism-collectivism, with ecological-threat roots), Gelfand (2018, the multi-level synthesis), and Harrington & Gelfand (2014, the 50-US-states extension). Bounded against `conformity` (the persona's yielding to a norm -- downstream; this engine is the field strength that sets the pressure to yield), `obedience` (yielding to an authority vs the diffuse norm field), `group` (a particular group's norm-formation vs the standing norm-strength regime it happens within), and `self-construal` (the individual self-boundary -- the two form a culture cluster but are orthogonal axes: tight/loose cut across independent/interdependent). Set at patch as the free level. No whitelist required -- the `tightness_looseness`/`tight`/`loose` stems are unique.
