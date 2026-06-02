# @chbrain/khai-tests

## 0.0.9

### Patch Changes

- 363ba52: Add structural rule atoms for the engine docs standard (not yet wired into
  `validateEnginePackage` - they land with the severity dimension so they can ramp
  from advisory to fail without breaking installed engines):
  - `rules.checkLinkText(text)` - a link's text is read literally by an LLM, so it
    must be a natural name, never a filename. Flags empty link text and any label
    that ends in a file extension or equals the target's basename
    (`[position_gender.md](...)` fails; `[gender](position_gender.md)` passes).
  - `rules.looseFiles(files)` - the "no file hangs loose" check (the Obsidian
    graph): given `[{ name, text }]`, returns the files with no markdown-link edge
    to any other file in the set. Backtick mentions are not edges, which is why
    REFERENCES must _link_ the member files, not name them in backticks.
  - `rules.checkClauseDash(text)` - the spaced hyphen " - " is the LLM's em-dash in
    disguise, not the house voice ( , ; : () ). Flags the inline clause dash while
    exempting line-start list markers (`*` and `-`) and `---` fences. (em/en-dash
    stay in `checkEncoding`.)
  - `rules.checkNoFooter(text)` - flags a trailing `_..._` version/attribution
    stamp; metadata belongs in YAML frontmatter, not a footer.
  - `rules.checkHasFrontmatter(text)` - a doc whose metadata must be machine-
    readable needs a leading `---` YAML block, not a `**Bold:**` header.

- 51cfc02: Wire the engine docs standard into `validateEnginePackage` as an advisory lane.
  `engineDocChecks(pkgDir)` runs the five doc-check atoms (clause-dash, link-text,
  no-footer, frontmatter, loose-file) over a package's own `.md` files and
  surfaces them as `warnings`, never `errors`: a downstream consumer is informed,
  not failed, while the world migrates (the audit/warn level of the enforcement
  model). `FileResult` gains an optional `warnings` field; the CLI prints them
  with a `⚠` marker and never exits non-zero on them. Our own conformance suite
  holds engines to zero warnings, so gender (already compliant) proves the wiring.
- 295d0c3: Document the enforcement model in the README: the kit as a "linter for worlds"
  (engines are plugins, the dependency graph is the law set), the audit/warn/fail
  level axis (ESLint / `npm audit` vocabulary, engine default + world override),
  and the two lanes - a structural linter lane (checks the declaration) and an
  NLP-review lane (checks the embodiment, caps at warn). Doc only; clearly marks
  what the kit does today (linter lane, single implicit `fail` level) vs the
  target it describes.
- Updated dependencies [9f0dc51]
- Updated dependencies [abf5cdb]
  - @chbrain/khai-arch@0.0.9

## 0.0.8

### Patch Changes

- 5466259: Enforce the WIRES card. `validateEnginePackage` now calls khai-arch's
  `engineCard(manifest)`, so every engine package must declare a valid card (the
  five WIRES chapters) or fail conformance - the canon owns the shape, the kit
  enforces it. Adds a test proving a cardless engine is rejected; the real gender
  engine passes.

## 0.0.7

### Patch Changes

- 5be8d08: Encoding rule: the sanctioned dash is the spaced hyphen `-`, never `--`.
  `checkEncoding` already rejected en/em-dashes but pointed authors at `--`,
  which markdown renders back into an en-dash (the disguised dash). The guidance
  now reads `use ' - '`, matching the canon's own encoding rule. (khai-arch's
  encoding test is tightened in the same change to forbid the en-dash character
  too, not only the em-dash.)

## 0.0.6

### Patch Changes

- Updated dependencies [1fd1552]
  - @chbrain/khai-arch@0.0.8

## 0.0.5

### Patch Changes

- Updated dependencies [f34d674]
  - @chbrain/khai-arch@0.0.7

## 0.0.4

### Patch Changes

- Updated dependencies [e3fc4d4]
  - @chbrain/khai-arch@0.0.6

## 0.0.3

### Patch Changes

- Updated dependencies [dbb3892]
  - @chbrain/khai-arch@0.0.5

## 0.0.2

### Patch Changes

- Updated dependencies [b8549f6]
  - @chbrain/khai-arch@0.0.4

## 0.0.1

### Patch Changes

- Initial release: the khai conformance kit — rule atoms and
  `validateContentFile` / `validateEnginePackage` / `discoverEnginePackages`,
  plus a `khai-tests` CLI, validating content packages against the
  architecture canon. Depends on `@chbrain/khai-arch`.

- Add the consumer surface for projects that _use_ engines:
  `validateProject` / `validateInstanceFile` / `wiringRequirements`, plus the
  `checkWiring` rule atom. Engines declare wiring requirements in their manifest
  (`requires: [{ on, section, link }]`); the kit discovers a project's instance
  files by their `khai:` frontmatter and enforces that each instance links the
  required engine target in the required section — e.g. every persona must link
  a gender expression under Projection. Engine declares, kit enforces, mirroring
  arch-declares-types / kit-enforces-them. `validateContentFile` now treats
  `owner` as optional so a consumer's own instances validate structurally
  without asserting khai ownership.

- Add a `--project [dir]` mode to the `khai-tests` CLI for downstream repos:
  it reads the installed engines' manifests from `node_modules/@chbrain/*`,
  discovers the repo's instance files by their `khai:` frontmatter, and enforces
  the canon plus every engine wiring requirement, exiting non-zero on failure
  (drops straight into CI or a pre-commit hook). The existing file-path mode
  (engine-package validation) is unchanged. Wiring links into installed engine
  content are exempt from the local broken-link check, since they resolve via
  npm rather than being co-located. Adds a README documenting both modes.
