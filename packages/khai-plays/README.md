# khai-plays

The play registry: the bill. khai holds the index of the houses, not the
productions. Each card registers a house (a `khai-plays-<source>` collection)
and the package the website pulls to read that house's plays. khai knows the
house by its card; the website knows it from khai and pulls the package for the
rest.

Generated from the registry, never hand-edited. Run
`npx @chbrain/khai-plays register <source> --blurb "..."` to add a card (its
shape is in `registry/README.md`); it rewrites this file.

## Houses

None registered yet.

## Reading the bill

`loadRegistry()` and `houses` return the validated cards, sorted by id. The
website renders them and pulls each card's package to read that house's plays.
