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

- **[Buechner](https://github.com/ChBrain/khai-plays-buechner)** (programme `@chbrain/khai-plays-buechner`): Fragmentarische Seziermesser-Poesie und die Anatomie des sozialen Leids, übersetzt in das strukturelle Spielfeld von khai.

## Reading the bill

`loadRegistry()` and `houses` return the validated cards, sorted by id. The
website renders them, links each house, and pulls its programme to read that
house's plays.
