# @chbrain/khai-plays

## 0.0.5

### Patch Changes

- bec048e: A malformed registry card no longer crashes module import (and with it the CLI
  that imports the module), which previously left no way to run the tool to fix
  the card. The `houses` export is now resilient at import (a bad card yields an
  empty bill rather than a thrown import), while `loadRegistry()` stays strict and
  the CLI's render/register path catches it and blocks with a clear exit-1 message
  naming the offending card -- so a bad card still blocks until fixed, it just no
  longer throws on import. Malformed-JSON errors now name the file too.

## 0.0.4

### Patch Changes

- df131a8: Add management voices: choregos position, Nicias and Pericles personas.

## 0.0.3

### Patch Changes

- 87a4126: governance: enforce English language validation for play registry blurbs and convert Büchner blurb to English.

## 0.0.2

### Patch Changes

- 39c5111: Register khai-plays-buechner in the plays registry to make it available in the bill.
- a29f1e7: Register the Grimm production house in the play registry: add the `grimm` card (programme `@chbrain/khai-plays-grimm`) and rewrite the bill.

## 0.0.1

### Patch Changes

- 5443692: Give khai-plays a `register` and `render` CLI, and make the README a generated
  view of the bill. `npx @chbrain/khai-plays register <source> --blurb "..."`
  writes `registry/<slug>.json` and rewrites `README.md` from the whole registry;
  `render` rewrites the README alone, so a hand-added card or a drift check can
  refresh the human view without touching the data. A card names a house and its
  programme: `repo` is the house (required, since the repository is the house and
  a house with no resolvable home is not yet a production) and `package` is the
  programme the website pulls for that house's plays, with `title`/`blurb` for the
  bill. Both `repo` and `package` default from the slug, so the impresario passes
  only `--blurb`. A test asserts `README.md` matches `renderReadme(houses)`, so the
  bill and its README can never drift.
- e5a8ffd: Add khai-plays: the play registry, the bill. khai holds the index of houses, not
  the productions. Each house (a khai-plays-<source> collection) registers one
  entry under registry/<source>.json; loadRegistry reads and validates them sorted
  by id, and a malformed card fails the build. The website reads the bill and
  renders one card per house with its productions underneath. Pure node, no canon
  dependency: a card is metadata, not khai content.
