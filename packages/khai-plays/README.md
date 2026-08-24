# khai-plays

The house registry: the bill. khai holds the index of the houses, not what
they hold. One registry covers every house that depends on khai, and each
card declares its `kind` -- the three share an architecture and hold
different things:

- **stage** -- a source staged as plays.
- **work** -- khai's own canon given a voice as a finished piece.
- **canon** -- reusable material a production draws on.

Each card names the house (its repository) and the package it publishes.
khai knows the house by its card; the website knows it from khai and pulls
the package for the rest.

Generated from the registry, never hand-edited. Run
`npx @chbrain/khai-plays register <source> --kind <kind> --blurb "..."` to add
a card (its shape is in `registry/README.md`); it rewrites this file.

## Stage

A source staged as plays.

- **[Buechner](https://github.com/ChBrain/khai-plays-buechner)** (`@chbrain/khai-plays-buechner`): Fevered, unfinished, a century ahead of their stage.
- **[Dickens](https://github.com/ChBrain/khai-plays-dickens)** (`@chbrain/khai-plays-dickens`): Debt, fog, and the machinery of institutions, answered by stubborn human warmth.
- **[Grimm](https://github.com/ChBrain/khai-plays-grimm)** (`@chbrain/khai-plays-grimm`): Oaths, taboos, and transformations, run to their exact and merciless end.
- **[H.C. Andersen](https://github.com/ChBrain/khai-plays-hcandersen)** (`@chbrain/khai-plays-hcandersen`): Longing, cruelty, and grace, dressed as a children's tale.
- **[Kleist](https://github.com/ChBrain/khai-plays-kleist)** (`@chbrain/khai-plays-kleist`): Broken trust, somnambulists, and sudden violence where a single misread sign shatters the whole order.
- **[Life 2 Live](https://github.com/ChBrain/L2)** (`@chbrain/khai-plays-l2`): "Life Is Very Exciting to Live It Very Embraced." Plays drawn from lived experience, each staged as a systemic production. Hard days held plainly, in a restrained first-person voice, the ordinary detail carrying the weight.
- **[Storm](https://github.com/ChBrain/khai-plays-storm)** (`@chbrain/khai-plays-storm`): Memory, the North Sea dike, and the past that will not stay buried, from the grey town by the grey sea.

## Work

Khai's own canon given a voice as a finished piece.

- **[Phoenix](https://github.com/ChBrain/khai-phoenix)** (`@chbrain/khai-phoenix`): A bestiary of fire: each beast one named phenomenon of combustion, speaking for itself, where the obvious way to fight it fails or feeds it.

## Canon

Reusable material a production draws on.

- **[Cultures](https://github.com/ChBrain/khai-cultures)** (`@chbrain/khai-cultures`): Each culture a full khai play: a theatre of that culture, cast from its own history under a Hofstede-tuned pitch.
- **[Misfits](https://github.com/ChBrain/khai-misfits)** (`@chbrain/khai-misfits`): Structural traps staged as systems: where local reason sums to collective ruin, no villain needed.

## Reading the bill

`loadRegistry()` and `houses` return the validated cards, sorted by id, each
carrying its `kind`. The website renders them, links each house, and pulls
its package to read what the house holds.
