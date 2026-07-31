# @chbrain/khai-engine-extended-self

## 0.1.1

### Patch Changes

- 21b42f7: Add the extended-self engine (piece: root + position + two processes) -- a possession experienced as a part of the self, an object into which a persona's identity has extended, so that having it enlarges the self and losing it diminishes it. The gap analysis (Tier-1 #11) found this homeless: the codebase held three _specializations_ of possession-as-self -- `heirloom` (inalienable to a line), `totem` (sacred to a collective), `document` (inscribed record) -- but not the ordinary private case they all specialize.

  - **Anchor (piece):** `extended-self` -- the object owned like property but felt like a limb, storing memory, capability, status, or continuity outside the body.
  - **Position:** `possessor` -- the persona whose self a particular object extends into, enlarged by having it and diminished by its loss, varying in how much self it invests.
  - **Processes:**
    - `appropriation` -- the taking of an object into the self (Belk's routes: controlling, creating, knowing, investing psychic energy).
    - `dispossession` -- the tearing of an object out of the self (loss, theft, divestment), and the shrinkage of the self it carried; eased by a deliberate divestment that draws the self back out first.

  Warranted (LORE) on Belk (1988, _Possessions and the Extended Self_), Csikszentmihalyi & Rochberg-Halton (1981, _The Meaning of Things_), James (1890, the material self), and McCracken (divestment rituals). Bounded against `identity` (the present self-story vs the material self stored in a thing), `place-attachment` (the movable object-as-self vs the bond to a place), the `heirloom`/`totem`/`document` specializations (lineage/sacred/inscribed vs the ordinary private case), the `bias` engine's endowment member (the object incorporated into identity vs the mere ownership-premium valuation bias), and `grief`/`shame` (the self-diminishment the engine owns vs the felt emotion of the loss). Set at patch as the free level. No whitelist required -- the `extended_self`/`possessor`/`appropriation`/`dispossession` stems are unique (`incorporation` is the ritual engine's, so appropriation carries the taking-in here).

- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
  - @chbrain/khai-arch@0.1.23
