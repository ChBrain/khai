# @chbrain/khai-composite-freud

## 0.1.1

### Patch Changes

- 5553fc3: Add the freud composite (process root + three position movements) -- the Freudian psyche read as a compound: a mind divided against itself and largely unconscious, driven by intrapsychic conflict, defended against its own drives, and doomed to repeat its past in the present. This is the "then composite" step of the Freud effort, built over the four Freud engines plus the pre-existing psychodynamic atoms, now that engine completeness is done.

  - **Root (process):** `freud` -- the psyche as intrapsychic conflict, mostly unseen, managed by defense, repeated in relationship. Adds only the read of the compound; no atom is restated.
  - **Movements (position)** -- three, grouping six atoms:
    - `apparatus` -- the standing structure: the three agencies (`structural-model`: id/ego/superego) held largely in the unconscious (`the-unconscious`). Who the persona is made of, and that the making runs unseen.
    - `warding` -- the defensive economy: signal anxiety (`anxiety`) and the defenses that answer it, mature to immature (`defense`). How the persona keeps the unbearable out, at a cost to seeing straight.
    - `relation` -- the object world: the early attachment template (`attachment`) repeated and the repressed transferred onto present figures (`transference`). How the past returns in present bonds.

  **Six atoms, declared as dependencies**, hard-linked by package name so every link resolves through the dependency graph: `structural-model`, `the-unconscious`, `anxiety`, `defense`, `transference`, `attachment`.

  **Warrant is a lineage, not solo work** -- the point the maintainer pressed, and the axis this composite is built to honour. Freud gave the spine (the unconscious, the structural model, signal anxiety, defense, transference, repetition), but the psychology read here is a collaborative science built on and beyond him: Anna Freud (mechanisms of defense), Hartmann (ego psychology), Vaillant (the empirical defense-maturity hierarchy), Klein (object relations), Bowlby & Ainsworth (attachment, re-founded on ethological/observational ground), and Andersen & Chen (transference re-established experimentally as the relational self). The Origin table credits the tradition, not one author.

  **Scope note.** The specific love-and-hate toward one object stays with the `love-hate` composite, and the general structure of opposed evaluation with the `ambivalence` engine -- this composite reads the apparatus and its dynamics, not that affect. The clinical diagnosis of the disorders is a clinical tier this composite does not model; it reads the psyche every persona has, not the illness some develop. Set at patch. No whitelist required -- the `freud` / `apparatus` / `warding` / `relation` stems are unique.

- Updated dependencies [d2a004c]
- Updated dependencies [7b099d9]
- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
- Updated dependencies [89f6397]
- Updated dependencies [86af70e]
- Updated dependencies [6ad4c56]
- Updated dependencies [e671fa4]
  - @chbrain/khai-engine-anxiety@0.1.1
  - @chbrain/khai-engine-defense@0.1.1
  - @chbrain/khai-arch@0.1.23
  - @chbrain/khai-engine-structural-model@0.1.1
  - @chbrain/khai-engine-the-unconscious@0.1.1
  - @chbrain/khai-engine-transference@0.1.1
