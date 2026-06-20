# @chbrain/khai-tests

## 0.1.26

### Patch Changes

- 86520e7: registry: discriminated entries, optional geo iso, and referencing collections

  `buildRegistry` now stamps a `kind` discriminator on every entry, merges an
  optional per-item `geo.json` `iso` (absent ⇒ non-mappable), and supports
  referencing collections declared in `khai.collections` (e.g. `groups`) whose
  entries derive their `references` from the casts in their anchor file. The
  numbering invariant counts the primary collection only, so referencing
  collections never move the minor. `verifyRegistry` validates the richer shape:
  `kind` (when present) must match its collection, `iso` must be a non-empty
  string when present, and each `references` id must name an existing member of
  the referenced collection. New exports: `resolveCollections`, `collectionKind`.
  Single-collection plays and cultures houses are unaffected.

- Updated dependencies [046d1a9]
- Updated dependencies [323b66b]
- Updated dependencies [2f1c8be]
  - @chbrain/khai-arch@0.1.19
  - @chbrain/khai-language@0.1.4
  - @chbrain/khai-rules@0.1.6

## 0.1.25

### Patch Changes

- bbca1ce: Generalize the registry/numbering machinery from `plays`-only to a named
  collection. A house declares `khai.collection` in package.json (a string
  shorthand, or a `{ dir, key, anchor }` object); it defaults to plays, so every
  existing play house is byte-identical. `buildRegistry`, `verifyRegistry`,
  `validateCollectionRegistry` (new; `validatePlayhouseRegistry` kept as an
  alias), `countItems` (new; `countPlays` kept as an alias), and the project
  validator all key off the resolved collection. This lets a non-plays content
  house (e.g. `khai-cultures` with a `cultures/` folder) build a
  `registry.cultures` bill and ride the same computed-minor numbering.

## 0.1.24

### Patch Changes

- Updated dependencies [8fb2701]
- Updated dependencies [a222634]
  - @chbrain/khai-stage@0.0.20
  - @chbrain/khai-arch@0.1.17

## 0.1.23

### Patch Changes

- cb627d0: The management convergence gate reads the blueprint live from @chbrain/khai-stage
  instead of a committed snapshot. Removes src/management-core/, the `management
build` command, and the snapshot/blueprint in-sync test; checkManagement now
  compares a house directly against the installed khai-stage blueprint. This drops
  the snapshot-vs-blueprint coupling that made a blueprint-core change unmergeable
  when split across the stage and governance lanes. Adds @chbrain/khai-stage as a
  dependency.
- Updated dependencies [906c053]
  - @chbrain/khai-stage@0.0.19

## 0.1.22

### Patch Changes

- 6c1e006: Add the management convergence gate (Order 0b). `khai-tests management build`
  snapshots the shared management core from the khai-stage blueprint into the
  package (the single writer); `khai-tests management check [dir]` holds a house's
  management to that snapshot, allowing only overlay differences (cast personas,
  house plans, orders/). The Roadie/touring module is deferred (not in the core
  yet). No new runtime dependency; the snapshot ships in the package.
- 2ea7969: Resync the management core snapshot with the blueprint (it had lost the
  `language: english` fields after the blueprint fix), and add the management gate
  tests: a snapshot/blueprint in-sync guard (catches a stale snapshot in CI) plus
  checkManagement behaviour (converged passes; drift, missing core, and missing
  home are flagged; touring stays out of the core).

## 0.1.21

### Patch Changes

- bcc68e2: registry build: source a play's `description` from its frontmatter (the
  English-facing logline the canon already permits) instead of the first `## Arc`
  paragraph. The Arc (the declared-language synopsis the book reads) stays the
  fallback when no frontmatter description is authored, so a house keeps building
  while its plays adopt the field. This lets `registry.json` be English while the
  play files stay in their declared language.

## 0.1.20

### Patch Changes

- 05a336c: reviewer-assist: add `titleLeakAudit`, an audit-only check that flags source-language text leaking into an element's English `title:` (the source name belongs in `declared:`). It never warns, fails, or edits — a blanket `title === declared` rewrite would corrupt proper nouns, so it surfaces candidates for human triage in two buckets (a source-language marker in the title; or `title` equal to `declared`). Wired into `validateInstanceFile`/`validateProject` and exported for direct use.

## 0.1.19

### Patch Changes

- 4a1d6b1: `buildRegistry` now derives the version from the play count (the minor IS the
  count) and reconciles it into both `package.json` and `registry.json`, making
  the build the single writer of the minor. A manual edit or a stray minor
  changeset that drifted the version is healed on the next build (e.g. `0.77.x`
  with 76 plays becomes `0.76.0`); the major is preserved (the numbering guard
  still flags a non-zero major) and the patch is preserved unless the count moves
  the minor, which starts a fresh `.0`. New helpers `deriveVersionFrom`,
  `deriveHouseVersion`, and `countPlays` are exported. The numbering guard remains
  as the verification that the committed registry matches the play count on disk.

## 0.1.18

### Patch Changes

- 71209a2: Add casting-coverage validation to `validateProject`. A plot must cast at least
  one element of its play's Company (links it inline); a plot that names the
  company only in plain prose is now an error, the dual of the position→persona
  cast check at the play level. A Company element no plot casts is reported as a
  warning, since the Company is the closed cast a play may field, not a mandate
  that every member appear.
- 61c021e: Enforce the playhouse numbering invariant in `validatePlayhouseRegistry`: a
  house's version minor must equal its play count (adding a play is a minor bump,
  so the minor tracks the count). A drifted minor, a non-semver version, or a
  non-zero major (which would reset the minor while the count keeps climbing) is
  now an error rather than silent drift found downstream. Existing registry test
  fixtures are aligned to the invariant (version 0.<count>.0).

## 0.1.17

### Patch Changes

- 4f64f65: Recognize `playwright_instructions.md` as a special engine file. Every engine may
  ship a Playwright wiring guide (a `khai: instructions` HACKS file explaining the
  engine's model). The kit exempts it from the manifest-member and loose-file
  checks, and validates it as an instructions instance when present. It is
  dev-steering, not engine content. (Making it _required_ is gated separately, once
  every engine carries it.)
- 993fc49: Require the Playwright wiring guide on every engine. `validateEnginePackage` now
  reports a finding when `playwright_instructions.md` is missing, the meta engine
  included - the spine carries a short guide that points at the Roadie, so there is
  no carve-out. The recognition (validate-when-present, exempt from manifest-member
  and loose-file checks) was added earlier; this flips it from optional to
  required, now that every engine carries one.

## 0.1.16

### Patch Changes

- ace7e20: Add the orphan-position gate: a needed position without a persona is a failure.
  `castErrors` groups position*\*.md and persona*\*.md per directory and flags any
  position no persona links to (via its Taxonomy); wired into validateProject so
  `khai-tests --project` enforces it. Makes the rule computed, not judged. The
  reverse (a persona pointing at a missing position) stays covered by the link
  check.

## 0.1.15

### Patch Changes

- 4605ef4: The kit learns the canon's licence. `validateProject` now checks every content
  instance's `license:` frontmatter against the licence the installed canon
  stamps into its authoring template for that type — computed from
  `@chbrain/khai-arch`'s `templates` export, never configured per repo, so a
  licence ruling made once in the canon reaches every house on the next
  dependency bump. A type the canon ships no template for (e.g. `order`) carries
  no expectation, and a canon too old to export templates disables the check
  rather than failing. `validateInstanceFile` and `validateContentFile` accept an
  optional `license` expectation (`"canon"` to derive it, an explicit string to
  pin it, `false` to skip); direct calls without it validate structure only, as
  before.
- Updated dependencies [65dd38d]
- Updated dependencies [db6e497]
  - @chbrain/khai-arch@0.1.14

## 0.1.14

### Patch Changes

- 5c4ad95: Teach the conformance kit the `class: meta` engine (the spine). An engine that declares `class: meta` carries the flavored instructions and the architecture (the extension point) a world runs on, not a content engine wired into a house/element chapter. `validateEnginePackage` now skips the two content-only ceremonies for such an engine -- the WIRES card and the card-rendered README -- and reads its members as a flat list of meta-type instances (instructions, architecture), each validated against the canon exactly like any other instance. Content engines are unaffected.

## 0.1.13

### Patch Changes

- 6181719: tests: cover the closed-plan verdict vocabulary. Assert a `status: closed` plan
  accepts `[x]`/`[F]`/`[?]` and rejects `[W]`/`[-]` as unresolved verdicts, while a
  draft or active plan is not held to it. Update the plan/order fixtures to spell
  the canon set (`[?]` flagged in place of the retired `[W]` waived).
- 10455e9: validate/tests: derive the closed-plan verdict gate and its test from the canon
  `planVerdicts` rather than restating a glyph set. The validator builds the mark
  class with each verdict escaped (so `-` is a literal, never a range) and its
  fallback tracks the canon. The conformance suite now asserts every canon verdict
  is accepted on a closed plan and a non-verdict mark is rejected, so it stays
  correct across a vocabulary change.
- 8b0bb06: validate: the plan target verdict vocabulary now holds for every plan, in a play
  or anywhere, whatever its status, not only a `closed` one. A resolved (non-open)
  target must carry a valid verdict; `[ ]` open is allowed until the plan is
  `closed` (a plan is closed only when every target carries a valid marker, no open
  `[ ]` left). Orders are held the same way (no status, so they must complete).
- Updated dependencies [ea7ae45]
- Updated dependencies [9c8c56a]
  - @chbrain/khai-arch@0.1.13

## 0.1.12

### Patch Changes

- d0cd960: validate: gate a closed plan's targets against the canon verdict vocabulary.
  Pull `planVerdicts` from @chbrain/khai-arch (guarded fallback `[x]`/`[F]`/`[?]`)
  and, for a `status: closed` plan, flag any target mark outside that set (`[-]`,
  `[W]`, ...) as an unresolved verdict. `[ ]` stays pending; draft/active plans are
  not held to it; orders keep their existing completion check.
- Updated dependencies [0ad27c2]
  - @chbrain/khai-arch@0.1.12

## 0.1.11

### Patch Changes

- f0720f0: Plan completion is now gated by `status`. Only a `closed` plan must resolve every
  target (no pending `[ ]`); a `draft` or `active` plan is in progress, so an
  in-world plan staged inside a play holds its targets as forward intent rather
  than being failed as incomplete. The `order` type has no status lifecycle, so
  its completion stays mandatory. Mirrors the scope-agnostic plan coda: completion
  is a state a plan reaches, not a precondition every plan must meet.

## 0.1.10

### Patch Changes

- b470ca2: The playhouse registry blurb gate no longer false-fails a valid one-sentence
  description. It counted every "." and rejected anything with more than one, so a
  blurb carrying a decimal ("v1.5"), a file name ("Node.js"), or a lowercase
  abbreviation ("e.g.") was wrongly flagged as multiple sentences. It now detects
  a real sentence boundary (a terminator followed by whitespace and a new
  capitalized word) instead. A lone underscore is also no longer treated as
  markdown, since an underscore in prose is usually an identifier (snake_case);
  bold/italic markers and link brackets still are.
- 549c09b: The CLI now fails loudly on two operator mistakes instead of silently
  proceeding: `--project <path>` errors (exit 2) when the path does not exist,
  rather than walking an empty tree and reporting "all instance files conform";
  and `pack ... --out` with no following value errors instead of silently
  falling back to `<dir>/dist`.
- 113d2d6: Add support for declared titles in playbooks, allowing a localized staging H1 title to match a `declared` frontmatter key while keeping `title` in English for the registry.
- 5f3941d: The plan/order "pending target" check now matches only an actual unchecked
  task-list item. It tested `line.includes("[ ]")`, so any Targets line that
  merely mentioned `[ ]` in prose or a code span (e.g. "use an empty array
  `[ ]`") was miscounted as a pending target and failed a complete plan/order.
  It now anchors to a list marker: `^\s*[-*+]\s+\[ \]`.
- a0c0327: The registry gate's "missing registry.json" error now points at the generator
  (`run khai-tests registry build`), so the (intended) hard requirement is
  actionable rather than just stated. Behavior is unchanged: a playhouse without
  a registry.json still fails.
- 3ab5fdc: The validator no longer crashes on a malformed package.json. readManifest,
  findEnginePackageFor, installedEngineManifests, the CLI's engine banner, and
  engineDocChecks all parsed package.json with an unguarded JSON.parse, so a
  single unreadable or malformed manifest (an installed dependency, or a file
  mid-walk) threw an uncaught exception and aborted the pre-commit gate / project
  validator with a raw stack trace. A shared readJsonOr helper now degrades
  gracefully: a bad installed manifest is skipped, a bad file mid-walk is treated
  as "no manifest here", and a bad package on the engine surface yields a clean
  "cannot read or parse package.json" finding.
- Updated dependencies [ae0c95e]
- Updated dependencies [9965037]
- Updated dependencies [bba3d28]
- Updated dependencies [a837c37]
- Updated dependencies [113d2d6]
- Updated dependencies [37f5dbe]
- Updated dependencies [de6ab9b]
- Updated dependencies [8984450]
- Updated dependencies [272d1dc]
- Updated dependencies [5c0d150]
- Updated dependencies [f50e14f]
- Updated dependencies [11425ea]
  - @chbrain/khai-arch@0.1.8
  - @chbrain/khai-language@0.1.3
  - @chbrain/khai-rules@0.1.5

## 0.1.9

### Patch Changes

- 9baea61: Make playhouse registry build and verify consistent: verify now resolves the
  playbook file with the same `play_*.md` discovery buildRegistry uses and applies
  the same id title fallback, so a freshly built registry.json passes verification
  even when a play's frontmatter omits `title`. buildRegistry now warns (without
  failing) when an extracted blurb won't pass the verify gate, and normalizes
  registry validation results to the standard errors/warnings/audit shape.

## 0.1.8

### Patch Changes

- 5f12684: Implement playhouse registry (registry.json) and play blurb E2E validation gates.

## 0.1.7

### Patch Changes

- cdfbf09: Add auto-scanning of management orders and plans in validateProject, and restore legacy order type validation to validateContentFile.
- Updated dependencies [7cd2eda]
  - @chbrain/khai-arch@0.1.6

## 0.1.6

### Patch Changes

- a38bcf6: governance: integrate order (DOIT) validation and conformance tests
- Updated dependencies [8435643]
  - @chbrain/khai-arch@0.1.5

## 0.1.5

### Patch Changes

- b5ab771: Require a `title` in content frontmatter, and enforce that it echoes the H1
  name (`# Type: <Name>`). `khai-rules` gains a `checkTitle` atom; `khai-tests`
  wires it into `validateContentFile`, so every validated instance -- engine
  content, consumer instances, and content surfaces generate downstream -- must
  carry a `title` that matches its H1. One pattern, recoverable from the markdown
  alone when the YAML is stripped.

  `checkH1` also now enforces that an instance carries **exactly one** H1 (`#`):
  by design a khai file has a single first-level header, so a second `#` is drift.

  Note: this is a stricter gate. Downstream content without a matching `title`, or
  with a second H1, will now fail validation; bump accordingly if releasing to
  external consumers.

- Updated dependencies [c5cb182]
- Updated dependencies [7dc7952]
- Updated dependencies [8ab94b7]
- Updated dependencies [b5ab771]
- Updated dependencies [6bffe4e]
  - @chbrain/khai-arch@0.1.3
  - @chbrain/khai-rules@0.1.2

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
