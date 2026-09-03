# khai-foyer

Read a published khai house from an installed dependency tree.

```js
import { createRequire } from "node:module";
import { openHouse, isContent } from "@chbrain/khai-foyer";

const house = openHouse("@chbrain/khai-cultures", {
  resolve: createRequire(import.meta.url).resolve,
});

for (const unit of house.units()) {
  for (const f of house.contentOf(unit)) {
    // f.file, f.role ("member" | "doc"), f.path
  }
}
```

## Why it exists

A house that runs a migration ratchet keeps its content in two places: some
units are directories under the umbrella package, some have been lifted into
their own packages beside it. The house's own gates were taught this. Consumers
were not, and went on resolving a unit by the rule that was true beforehand —
the collection directory, one subdirectory per unit.

That rule fails silently, and it fails more every month, because the ratchet is
one-way. A consumer reading the collection directory of a fully migrated house
reads an empty house, reports nothing wrong, and publishes nothing.

So no consumer constructs a path to a unit. The registry entry carries `source`
— the npm package that ships the files, and the path below its root — and npm's
own resolver turns that into a directory.

## What it will not do

**It will not quietly hand you a short house.** `units()` throws if any entry's
package cannot be resolved, naming every one. A caller who wants a partial
house asks for `{ partial: true }` and is handed the losses to report.

**It will not tell you packaging is content.** A unit's content is what the
registry vouches for (`members[]`) plus a closed set of companion documents
(`README.md`, `REFERENCES.md`). Everything else — the manifest, the licence
pair, the Playwright guide, coverage waivers, the changelog, and whatever the
packaging grows next — is `packaging`, and needs no consumer to know its name.

## API

| call                              | what                                                         |
| --------------------------------- | ------------------------------------------------------------ |
| `openHouse(specifier, {resolve})` | the house; `resolve` comes from the CONSUMING module         |
| `house.units(key?, {partial?})`   | every unit, resolved to a directory. Fails closed            |
| `house.unit(id, key?)`            | one unit by id                                               |
| `house.filesOf(unit)`             | `[{ file, role, path }]` — every file, classified            |
| `house.contentOf(unit)`           | just the content: `member` and `doc`                         |
| `house.read(unit, file)`          | one file's bytes                                             |
| `house.linkTarget(href, unit)`    | where a cast lands, in either link shape                     |
| `house.packageIds(key?)`          | npm name → unit id, for units that ship as their own package |
| `house.verify(key?)`              | what the shipped registry and the installed tree disagree on |

`resolve` is injected rather than imported because a resolver called from
inside this package resolves against this package's own `node_modules` — right
by luck under a hoisted install, wrong silently otherwise.

## Licence

Content under CC-BY-NC-SA-4.0, code under MIT. See `LICENSE` and `LICENSE-CODE`
at the repository root.
