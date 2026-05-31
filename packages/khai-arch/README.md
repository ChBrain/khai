# khai

The khai architecture spec - type definitions, mnemonics, and chapter rules
for the kaihacks system.

This package ships the canonical architecture as 9 markdown files in
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
- `architecture/instructions.md` - the meta type (HACKS method)
- `architecture/plot.md` - the system type
- `architecture/process.md`, `position.md`, `piece.md`, `place.md`, `persona.md` - the element types
- `architecture/model.md` - the companion overview (KAI HACKS AI canon), no frontmatter
- `architecture/_schema.yml` - JSON Schema for the spec frontmatter

## Licensing

- **Content** (`architecture/*.md`) - [CC-BY-NC-SA-4.0](LICENSE)
- **Code** (tests, configs, build scripts) - [MIT](LICENSE-CODE)
