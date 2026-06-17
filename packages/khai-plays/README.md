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
- **[Grimm](https://github.com/ChBrain/khai-plays-grimm)** (programme `@chbrain/khai-plays-grimm`): Oaths, taboos, and transformations, run to their exact and merciless end.
- **[H.C. Andersen](https://github.com/ChBrain/khai-plays-hcandersen)** (programme `@chbrain/khai-plays-hcandersen`): Longing, cruelty, and grace, dressed as a children's tale.
- **[Kleist](https://github.com/ChBrain/khai-plays-kleist)** (programme `@chbrain/khai-plays-kleist`): Broken trust, somnambulists, and sudden violence where a single misread sign shatters the whole order.

## Reading the bill

`loadRegistry()` and `houses` return the validated cards, sorted by id. The
website renders them, links each house, and pulls its programme to read that
house's plays.
