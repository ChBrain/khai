# khai

The khai architecture spec - type definitions, mnemonics, and chapter rules
for the kaihacks system.

This package ships the canonical architecture as 12 markdown files in
`architecture/`. The rendered version lives at
[architecture.kaihacks.ai](https://architecture.kaihacks.ai).

## Install

```bash
npm install @chbrain/khai-arch
```

The package is published to GitHub Packages under the `@chbrain` scope.
Configure `.npmrc`:

```
@chbrain:registry=https://npm.pkg.github.com
```

## Contents

- `architecture/architecture.md` - the meta type (GROW: the extension seam)
- `architecture/engines.md` - the meta type (WIRE: the engine contract)
- `architecture/instructions.md` - the meta type (HACKS method)
- `architecture/play.md`, `plot.md` - the house types (the production and its scenes)
- `architecture/process.md`, `position.md`, `piece.md`, `place.md`, `persona.md` - the element types
- `architecture/model.md` - the companion overview (KAI HACKS AI canon), no frontmatter
- `architecture/reference.md` - the companion standard for a component's REFERENCES.md (LORE), no frontmatter
- `architecture/_schema.yml` - JSON Schema for the spec frontmatter
- `templates/template_<type>.md` - one fillable skeleton per type, exported as `templates`
- `defaults/<type>.md` - filled, ready-to-tune starting sets, exported as `defaults` (today: `pitch`, the standard registers)

## Starting a file, and checking one

Two exports, and the difference is the whole point:

- **`templates`** starts a file. One complete skeleton per type, right chapters in
  the right order with the right frontmatter, and the kit proves each one valid
  against its own type contract (`khai-tests/tests/templates.test.mjs`). Stamp one
  and fill it in; do not write a khai file from memory of its chapters.
- **`types`** checks a file. The chapter contract a written file validates against.

```js
import { templates, types } from "@chbrain/khai-arch";

templates.process.text; // the skeleton to start from
types.process.chapters; // the contract to check against
```

A house that depends on this package already has the templates on disk at
`node_modules/@chbrain/khai-arch/templates/`, so starting from one costs a `cp`.
That is worth saying plainly here: ten productions once reached a house carrying
the same wrong chapter names, from a base whose own rules already tabled the
correct ones, because nothing pointed at the files that ARE the contract.

A stamped template validates, which is what makes it a safe start and also what
makes an unedited one shippable, so the prose under each heading is instruction
to the author and never content to leave behind.

## Licensing

- **Content** (`architecture/*.md`) - [CC-BY-NC-SA-4.0](LICENSE)
- **Code** (tests, configs, build scripts) - [MIT](LICENSE-CODE)
