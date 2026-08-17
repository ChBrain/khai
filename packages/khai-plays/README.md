# khai-plays

The play registry: the bill. khai holds the index of the houses, not the
productions. Each card names a house and its programme: the house is the
`khai-plays-<source>` repository, and the programme is the package the website
pulls to read that house's plays. khai knows the house by its card; the website
knows it from khai and pulls the programme for the rest.

Generated from the registry, never hand-edited. Run
`npx @chbrain/khai-plays register <source> --blurb "..."` to add a card (its
shape is in `registry/README.md`); it rewrites this file.

## Houses

- **[Buechner](https://github.com/ChBrain/khai-plays-buechner)** (programme `@chbrain/khai-plays-buechner`): Fevered, unfinished, a century ahead of their stage.
- **[Dickens](https://github.com/ChBrain/khai-plays-dickens)** (programme `@chbrain/khai-plays-dickens`): Debt, fog, and the machinery of institutions, answered by stubborn human warmth.
- **[Grimm](https://github.com/ChBrain/khai-plays-grimm)** (programme `@chbrain/khai-plays-grimm`): Oaths, taboos, and transformations, run to their exact and merciless end.
- **[H.C. Andersen](https://github.com/ChBrain/khai-plays-hcandersen)** (programme `@chbrain/khai-plays-hcandersen`): Longing, cruelty, and grace, dressed as a children's tale.
- **[Kleist](https://github.com/ChBrain/khai-plays-kleist)** (programme `@chbrain/khai-plays-kleist`): Broken trust, somnambulists, and sudden violence where a single misread sign shatters the whole order.
- **[Life 2 Live](https://github.com/ChBrain/L2)** (programme `@chbrain/khai-plays-l2`): "Life Is Very Exciting to Live It Very Embraced." Plays drawn from lived experience, each staged as a systemic production. Hard days held plainly, in a restrained first-person voice, the ordinary detail carrying the weight.
- **[Misfits](https://github.com/ChBrain/khai-misfits)** (programme `@chbrain/khai-misfits`): Structural traps staged as systems: where local reason sums to collective ruin, no villain needed.
- **[Phoenix](https://github.com/ChBrain/khai-phoenix)** (programme `@chbrain/khai-phoenix`): A bestiary of fire: each beast one named phenomenon of combustion, speaking for itself, where the obvious way to fight it fails or feeds it.
- **[Storm](https://github.com/ChBrain/khai-plays-storm)** (programme `@chbrain/khai-plays-storm`): Memory, the North Sea dike, and the past that will not stay buried, from the grey town by the grey sea.

## Reading the bill

`loadRegistry()` and `houses` return the validated cards, sorted by id. The
website renders them, links each house, and pulls its programme to read that
house's plays.
