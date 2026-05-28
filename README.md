# khai

The khai architecture spec - type definitions, mnemonics, and chapter rules
for the kaihacks system.

This package ships the canonical architecture as 8 markdown files in
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

- `architecture/plot.md` - the system type
- `architecture/process.md`, `position.md`, `piece.md`, `place.md`, `persona.md` - the element types
- `architecture/instructions.md` - the meta type
- `architecture/stack.md` - companion file (project-specific dependencies and runtime targets)
- `architecture/_schema.yml` - JSON Schema for the spec frontmatter

## Licensing

- **Content** (`architecture/*.md`) - [CC-BY-NC-SA-4.0](LICENSE)
- **Code** (tests, configs, build scripts) - [MIT](LICENSE-CODE)
