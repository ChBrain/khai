# @chbrain/khai-tests

The khai conformance kit. Validates content against the architecture canon
(`@chbrain/khai-arch`) and enforces the wiring requirements that engines
declare. Used by the workspace's own suites and by any downstream repo that
builds on khai.

## Install

```bash
npm install --save-dev @chbrain/khai-tests
```

Published to GitHub Packages under the `@chbrain` scope. Configure `.npmrc`:

```
@chbrain:registry=https://npm.pkg.github.com
```

## CLI

Two modes, one rule-set.

### Project mode — for repos that _use_ engines

Validate every instance file (your personas, plots, ...) in a project against
the canon **and** against the wiring requirements of the engines you have
installed:

```bash
npx khai-tests --project .
```

It discovers instance files by their `khai:` frontmatter, reads the installed
engines' manifests from `node_modules/@chbrain/*`, and enforces both. For
example, with `@chbrain/khai-engine-gender` installed, every `khai: persona`
must link a gender expression under its `## Projection`:

```
khai-tests: 1 engine(s) installed: gender (1 wiring requirement(s))
✖ content/sam.md: wiring(gender): "## Projection" must link one of
  [position_male.md, position_female.md]; found [no links]

khai-tests: 1 instance file(s) failed.
```

Exit code is non-zero on any failure, so it drops straight into CI or a
pre-commit hook. Pass a directory to check somewhere other than the cwd:
`npx khai-tests --project path/to/repo`.

### Engine mode — for authoring engine packages

Given content file paths, validate each affected engine _package_ against the
canon (the pre-commit path used inside this workspace):

```bash
npx khai-tests packages/engines/gender/position_female.md
```

## Library

The CLI is a thin caller over the same functions the test suite uses:

- `validateProject({ root, contentDir, owner })` — discover + validate a
  consuming repo.
- `validateInstanceFile(text, { requirements, baseDir, owner })` — one instance
  against its canon type plus matching wiring rules.
- `validateEnginePackage(pkgDir, { executeCompose })` — a whole engine package.
- `validateContentFile(text, { type, owner, baseDir })` — one file against one
  canon type.
- `wiringRequirements(manifests)` — derive enforceable requirements from engine
  manifests.
- `rules`, `parseDoc`, `sectionBody` — the underlying atoms.

## How wiring works

Engines **declare**, the kit **enforces** — the same split as the canon, where
`khai-arch` declares the types and this kit enforces them. An engine's
`package.json` carries a machine-readable requirement:

```jsonc
"khai": {
  "engine": "gender",
  "requires": [{ "on": "persona", "section": "Projection", "link": "expression" }]
}
```

Read: every `persona` instance must link one of the engine's `expression` files
under its `## Projection` section. `link` is `"anchor"`, `"expression"`, or
`"any"`. The kit resolves these to filenames and checks each consumer instance.

## Licensing

- **Code** — [MIT](../khai-arch/LICENSE-CODE)
