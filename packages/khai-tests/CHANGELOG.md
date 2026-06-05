# @chbrain/khai-tests

## 0.1.4

### Patch Changes

- 1306d37: validateEnginePackage now reads an engine's composition tree through the canon
  (engineMembers / compositionOrder), so an explicit-members ladder engine
  validates the same way as the anchor+expressions shorthand. Each content file is
  checked against its own member type, the orphan check runs against the member
  set, and the compose smoke runs over the tree leaves. No change for shorthand
  engines (gender normalizes through the identical path).
- 571d736: requirementsFromEngine now reads an engine's normalized member tree, so the
  wiring `link` is shape-agnostic: "anchor" resolves to the root member,
  "expression" to the leaves, "any" to the whole tree. A members ladder (a process
  root with channels and widths) now enforces its persona and Instructions wiring
  the same way the anchor+expressions shorthand does.

## 0.1.3

### Patch Changes

- Updated dependencies [c9eff7b]
  - @chbrain/khai-pack@0.0.3
  - @chbrain/khai-rules@0.1.1

## 0.1.2

### Patch Changes

- a18aabe: Add the **engine kind** of the serve engine: `packEngine(dir)` and a
  `khai-tests pack <engine-dir>` command package a khai content engine as a
  portable zip via `@chbrain/khai-pack`, in the cultures layout (generated README,
  authored REFERENCES, rendered WIRES card, and a license note at the root; the
  member files flat under `engine/`; no package.json, index.mjs, or tests). The
  engine is packaged **through its validator** — a non-conforming engine is never
  shipped.
- Updated dependencies [0d822cd]
  - @chbrain/khai-pack@0.0.2

## 0.1.1

### Patch Changes

- Updated dependencies [2ccfbc2]
  - @chbrain/khai-rules@0.1.0

## 0.1.0

### Minor Changes

- 01e4e73: Introduce the **LORE** reference standard. Every component's `REFERENCES.md`
  now carries four fixed canon chapters, in order, the warrant for the component
  to exist:
  - **L — Line of Work** — what it models, and what it isn't
  - **O — Origin** — the sources it rests on
  - **R — Restrictions** — what it refuses to claim, and to whom it delegates
  - **E — Encoding** — source to constraint, per file

  khai-arch gains `referenceChapters` and `referenceCard(text)` (sibling to
  `engineCard`): it validates the four chapters are present and in order,
  collects any author `### ` subchapters under each (the renderer paginates one
  (sub)chapter per snap), and returns `{ mnemonic, chapters, sections, coda }`.
  gender's `REFERENCES.md` is restructured as the first conformer.

  khai-tests gains the teeth: `validateEnginePackage` runs `referenceCard` over
  every engine's `REFERENCES.md`, so a missing or non-conforming warrant fails the
  suite. The standard is documented as a canon companion in
  `architecture/reference.md`.

### Patch Changes

- 185dc90: Section contract: derive the TO-prefix from the canon instead of hardcoding it.
  The full H2 list spells the type's mnemonic, so a "TO \_\_\_" type carries a two
  section prefix ahead of its chapters (the "T", the group above, and the "O",
  Owner, the origin), while a type whose mnemonic does not begin with "TO "
  (instructions=HACKS, play=ENACTS, engines=WIRE) carries neither -- its chapters
  spell the whole word.

  The kit now pulls the prefix vocabulary from khai-arch (`toPrefix`, guarded with
  a fallback), drops the dead `checkTitle` echo (the T slot is the group above,
  never a re-name of the H1, so its only contract is presence in the H2 set), and
  keeps the Owner value check for engine content. A migration tolerance accepts
  the legacy "Title" spelling of the T slot until the Title -> Taxonomy rename
  lands end to end. Also drops the stray Title/Owner from the instructions wiring
  fixture and adds a regression test for the contract.

- c2f86b5: KAIHACKS retirement: migration ledger + khai-rules core (Loop 1: encoding)
- ad5cd0c: Frontmatter: support per-type extra keys. `checkFrontmatter` now accepts an
  `extra` map (key -> allowed enum) beyond the base `khai/license/stamp`, and
  `validateContentFile` pulls it from the canon (`khaiArch.frontmatterExtras`,
  guarded) per instance type. Backward-compatible: with no extras, behavior is
  unchanged. This is the kit-side permission that lets the canon add persona's
  `type:` (real/archetype/fictional) next.
- 73f5f9d: Frontmatter: support a `required` flag on per-type extra keys. `checkFrontmatter`
  now accepts `{ values, required }` (a bare array stays shorthand for an optional
  key) and flags a missing required key. The fixture personas declare `type:` ahead
  of the canon flipping persona's `type:` to required (next, in the arch lane).
- 7443622: Retire the Title -> Taxonomy migration tolerance: the kit goes strict. The
  rename has landed end to end (canon, this kit's fixtures, the gender engine
  content), so `validateContentFile` no longer accepts the legacy `Title`
  spelling of a "TO \_\_\_" type's first slot -- the T slot is `Taxonomy`, the group
  above, and `Title` is now drift. Drops the tolerance branch and flips the
  guarded `toPrefix` fallback to `["Taxonomy", "Owner"]`. The kit's own fixtures
  move to `## Taxonomy`, and a regression test pins the strictness (a persona
  spelling the slot `Title` is rejected; `Taxonomy` passes). Stale "Title (T)"
  comments are corrected. The orphaned `checkTitle` echo in khai-rules is left for
  a separate follow-up.
- 88be37f: Add the template conformance test: assert every authoring template shipped by
  `@chbrain/khai-arch` is a valid content instance (`validateContentFile`, no
  `owner` so the check is structural). The loop closes — the kit proves the
  canon's templates, and the templates feed the kit's notion of a valid `<type>`.
- Updated dependencies [ab4667c]
- Updated dependencies [95f4264]
- Updated dependencies [c2f86b5]
- Updated dependencies [34c6d7b]
- Updated dependencies [01e4e73]
- Updated dependencies [2d29311]
- Updated dependencies [ad5cd0c]
- Updated dependencies [67e7925]
- Updated dependencies [73f5f9d]
- Updated dependencies [f17e74e]
- Updated dependencies [7ebebf0]
- Updated dependencies [1996d77]
  - @chbrain/khai-rules@0.0.2
  - @chbrain/khai-arch@0.1.0

## 0.0.11

### Patch Changes

- 77f514f: Close two engine-self gaps. `validateEnginePackage` now regenerates each engine's
  README from its manifest (via the canon's `renderEngineReadme`) and gates on
  drift: a missing or hand-edited README is an error, so the pointer can never
  disagree with the source of truth (deterministic, the answer is in the bytes).
  The advisory docs lane also now flags an en/em-dash in a README or REFERENCES
  doc, holding those files to the house voice ( , ; : () ) the way checkEncoding
  already holds content instances.
- 8803e6c: Add a severity model to wiring enforcement. Each requirement now resolves to a
  level: `audit` (note), `warn` (nudge), or `fail` (gate, the only level that
  exits non-zero). The engine declares its default per requirement
  (`requires[].level`, defaulting to `fail` for back-compat); a world overrides it
  per requirement id via `levels`. `validateInstanceFile` returns leveled findings
  and `validateProject` buckets them into errors / warnings / audit. The CLI prints
  `✖` for failures, `⚠` for warnings, and `·` for audit notes, exiting only on
  failures. This is the same kit invoked three ways: audit, self-audit, or CI.

## 0.0.10

### Patch Changes

- c78f4cd: `engineDocChecks` now voice-checks the WIRES card prose too. The card lives in
  `package.json` (JSON), outside the `.md` doc-checks, yet it is what the website
  renders, so a dirty card (clause dash or em/en-dash) previously slipped through
  and had to be caught by hand. It is now an advisory warning per chapter
  (`package.json#card.<chapter>`), so "cards stay clean" is self-enforcing for
  every engine instead of manual. Gender (already clean) stays at zero warnings.
- cebda9f: `checkClauseDash` no longer flags a spaced hyphen between two numbers
  (`400 - 500`, `2006 - 2012`): the CVI sanctions it for numeric ranges. A
  spaced hyphen anywhere else (including number-to-word) is still flagged as a
  clause dash.
- Updated dependencies [e4d7aef]
- Updated dependencies [cebda9f]
  - @chbrain/khai-arch@0.0.10

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
