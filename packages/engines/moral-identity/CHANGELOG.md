# @chbrain/khai-engine-moral-identity

## 0.1.1

### Patch Changes

- 085bb02: Add the moral-identity engine (position) -- how central being a moral person is to the persona's self-concept. Fills a gap the `virtue` engine explicitly disclaims: virtue reads a virtue as a moment's event and never classifies the persona, so the standing moral self -- and its self-regulatory pull on conduct -- was unowned. Moral identity is that self-schema, built around moral traits, whose force comes from the motive to stay consistent with the moral person one takes oneself to be (Blasi's self-consistency; Aquino & Reed's self-importance of moral identity).

  - **Anchor (position):** `moral identity` -- the standing centrality of the moral self, carried beneath conduct.
  - **Standings (positions), the quadrants of Aquino & Reed's two dimensions (internalization x symbolization):** `internalized` (high private centrality, low display -- the quiet moral self, strongly self-regulating but unbroadcast), `symbolic` (high outward expression, lower private centrality -- the shown moral self, exposed to moral licensing and the display-substance gap), `custodian` (both high -- the integrated moral self, the strongest self-regulator, at risk of rigidity), `peripheral` (both low -- morality off to the side, little self-regulatory pull, reliant on external constraint).

  Warranted (LORE) on Aquino & Reed (2002; the two-dimension model), Blasi (the self-model and self-consistency motive), Aquino/Freeman/Reed/Lim/Felps (2009; chronic accessibility and situational activation), Hardy & Carlo (moral identity as the bridge from judgment to conduct), and Reed & Aquino (moral licensing; the circle of moral regard). Bounded against `virtue` (the firing of a virtue as event, which disclaims the trait), `moral-judgment` (reading another's conduct vs the self's moral centrality), the `self-conscious` composite (guilt/shame/pride, the emotions a breach of the moral self registers), `identity` (the whole self-concept vs the moral region's centrality), and the `self-relation` composite (the modes of relating to the self vs this content of the self). Set at patch as the free level. No whitelist required -- the `moral_identity` anchor and `internalized`/`symbolic`/`custodian`/`peripheral` standing stems are unique (`internalization` was avoided as an existing homonym).

- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
  - @chbrain/khai-arch@0.1.23
