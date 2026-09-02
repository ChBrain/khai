# khai-plays

The house registry: the bill. khai holds the index of the houses, not what
they hold. One registry covers every house that depends on khai, and each
card declares its `kind` -- the three share an architecture and hold
different things:

- **stage** -- plays staged from another's source.
- **work** -- plays staged from khai's own canon.
- **canon** -- plays other productions draw on as material.
- **chain** -- infrastructure every house shares, on the bill by exception.

Each card names the house (its repository) and the package it publishes.
khai knows the house by its card; the website knows it from khai and pulls
the package for the rest.

11 houses: 6 stage, 1 work, 2 canon, 2 chain.

Generated from the registry, never hand-edited. Run
`npx @chbrain/khai-plays register <source> --kind <kind> --blurb "..."` to add
a card (its shape is in `registry/README.md`); it rewrites this file.

## Stage

Plays staged from another's source.

- **[Buechner](https://github.com/ChBrain/khai-plays-buechner)** (`@chbrain/khai-plays-buechner`): Fevered, unfinished, a century ahead of their stage.
- **[Dickens](https://github.com/ChBrain/khai-plays-dickens)** (`@chbrain/khai-plays-dickens`): Debt, fog, and the machinery of institutions, answered by stubborn human warmth.
- **[Grimm](https://github.com/ChBrain/khai-plays-grimm)** (`@chbrain/khai-plays-grimm`): Oaths, taboos, and transformations, run to their exact and merciless end.
- **[H.C. Andersen](https://github.com/ChBrain/khai-plays-hcandersen)** (`@chbrain/khai-plays-hcandersen`): Longing, cruelty, and grace, dressed as a children's tale.
- **[Kleist](https://github.com/ChBrain/khai-plays-kleist)** (`@chbrain/khai-plays-kleist`): Broken trust, somnambulists, and sudden violence where a single misread sign shatters the whole order.
- **[Storm](https://github.com/ChBrain/khai-plays-storm)** (`@chbrain/khai-plays-storm`): Memory, the North Sea dike, and the past that will not stay buried, from the grey town by the grey sea.

## Work

Plays staged from khai's own canon.

- **[Phoenix](https://github.com/ChBrain/khai-phoenix)** (`@chbrain/khai-phoenix`): A bestiary of fire: each beast one named phenomenon of combustion, speaking for itself, where the obvious way to fight it fails or feeds it.

## Canon

Plays other productions draw on as material.

- **[Cultures](https://github.com/ChBrain/khai-cultures)** (`@chbrain/khai-cultures`): Each culture a full khai play: a theatre of that culture, cast from its own history under a Hofstede-tuned pitch.
- **[Misfits](https://github.com/ChBrain/khai-misfits)** (`@chbrain/khai-misfits`): Structural traps staged as systems: where local reason sums to collective ruin, no villain needed.

## Chain

Infrastructure every house shares, on the bill by exception.

- **[Website](https://github.com/ChBrain/khai-website)** (`@chbrain/website`): The rendered surface for the kaihacks system: the source of architecture.kaihacks.ai and the surrounding pages, which reads the bill and pulls each house's package.
- **[Writing Archive](https://github.com/ChBrain/khai-writing)** (`@chbrain/khai-writing`): The chain's writing archive: the writing the plays produced, rendered as venue-neutral results, and the ledger of where each result has been published.

## Reading the bill

`loadRegistry()` and `houses` return the validated cards, sorted by id, each
carrying its `kind`. The website renders them, links each house, and pulls
its package to read what the house holds.
