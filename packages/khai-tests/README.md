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

### Science index — the forward science → engine map

Invert every engine's `REFERENCES.md` Origin table into a generated
`docs/SCIENCE.md`: navigate from a scholar or theory to the engines that rest on
it. `build` is the single writer; `verify` is the drift gate (the committed index
must equal a fresh build from source).

```bash
npx khai-tests science build   # regenerate docs/SCIENCE.md
npx khai-tests science verify  # fail if the committed index is stale
```

### Science keying — the cross-unit warrant instruments

Every khai surface that rests on research — engines and composites here,
content units in a collection house — carries a per-unit warrant; these
instruments ask the one question no per-unit gate can: _is this science already
carried elsewhere in this root?_ They run off the same collector as the build
(never off the rendered markdown), so the build and the checks cannot drift.
The rule: the same scholar across different works is expected; the same
(scholar, work) carrying the spine of two units is a finding. Configured exits
live in the root's `khai-guard.config.json` — `workPolicy.canon` (a field's
foundational text, legitimately shared), `workPolicy.contrastMarkers` (a work
cited to hold a line, not carry one), `workPolicy.aliases` (same work, two
spellings) — and in an engine root the composition itself is a computed exit: a
composite citing its member atom's science composes, it does not duplicate.
`scholarPolicy.homonyms` declares shared surnames (`"Hart": ["Julian Tudor",
"Oliver"]`), the build keys them as `Hart (Oliver)`, and the namesake wall
holds every declared surname resolved. The build strips generational suffixes
(Jr., III) and resolves declared forms longest-first, both computed, so neither
needs a per-house detection wall.

```bash
npx khai-tests science overlap                    # the shared-work report; exit 1 on findings
npx khai-tests science check "Deci :: Effects of Externally Mediated Rewards"
                                                  # pre-authoring: does this spine anchor a unit?
npx khai-tests science surname Miller             # is this surname anywhere in the index,
                                                  # bare or resolved? (the scan `check` cannot do)
npx khai-tests science namesakes                  # declared surnames left unresolved; exit 1 if any
```

### House content walls -- a house in either layout, one resolver

A collection house is not always one directory: a house may migrate its
collection into a workspace, one unit at a time, so a unit can be a directory
under the collection or a package standing beside it (`khai.class === "house"`).
`resolveHouse(root)` finds the house by what a manifest DECLARES, in either
shape, and every wall below reads through it, so a house mid-migration never
looks empty to a check that has not caught up.

```bash
npx khai-tests house check .                                 # the whole house
npx khai-tests house check . --base <sha> --head <sha>       # only what the range authored
```

Prints the resolved house (its package, its collection, its production count)
and runs two walls:

- **isolation**: a relative markdown link inside a unit must resolve inside
  that unit's own directory (`path.resolve`, never a string prefix test, so a
  link nesting deeper into the same unit is not confused with one that
  escapes it). Runs only when the house declares `isolationPolicy` in its
  `khai-guard.config.json` -- a house with a real cross-unit idiom (one
  unit's position held one way and cited by name from another) is red on
  every such link until it says what it means to allow, and a wall that is
  red on content a house wrote on purpose is not yet a wall:

  ```jsonc
  "isolationPolicy": { "allow": ["position_language_*.md", "position_culture_*.md"] }
  ```

  `allow` matches a link's target by basename glob (`*` only); a package
  specifier (`@scope/pkg/...`) is never a finding here at all, since a unit
  reaching another PACKAGE by name is npm's question, not this one's.

- **filenames**: any path component under a unit's own directory carrying a
  non-ASCII character. macOS stores a path decomposed (NFD) and Linux composed
  (NFC), so the same accented name is different bytes on each and a link
  written against one stops matching a checkout on the other.

With `--base`/`--head`, both walls scope to the units the range **authored**
(`touchedUnits`): a unit whose only change was a link's target being rewritten,
or that the range never touched, owes nothing. The library exposes the pieces
separately for a house's own gate to hold to a baseline (`ratchet`) rather than
demand the whole house at zero on day one.

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
- `resolveHouse(root)`, `unitsOf(house)`, `touchedUnits(house, { base, head })`,
  `isolationErrors(house, { allow })`, `loadIsolationPolicy(root)`,
  `filenameErrors(house)`, `ratchet({ name, findings, baseline })`: the house
  content walls behind `house check` (see above), for a house's own gate to
  call directly.

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

## Enforcement model

The kit is a **linter for worlds**. Engines are plugins — a world installs
`@chbrain/khai-engine-*`, and its dependency graph _is_ the set of laws in
force. Each requirement runs at a **level** the world picks, and findings come
from one of two lanes. Nobody has to learn a new model: it's ESLint, `npm
audit`, and NLP review, wearing one hat.

### Levels — like ESLint and `npm audit`

- **audit** — report only ("tell me"); exit code untouched.
- **warn** — surfaced as a warning; exit code untouched.
- **fail** — hard error; non-zero exit, breaks CI.

The engine declares a default (the canon: _the engine declares the rule and its
level_); the world overrides per rule. A strict world sets gender's law to
`fail`; a travesty-show world sets it to `audit`.

### Two lanes — linter and reviewer

- **Linter lane (structural).** Deterministic, binary, cheap. _Is the law
  declared? Does the persona link a gender under `## Projection`?_ It checks the
  **declaration** — this is `checkWiring` plus the canon structural rules, and
  runs at any level.
- **NLP-review lane (semantic).** A reviewer, not a compiler. _Does the prose
  carry the read it links? Does Shadow contradict Projection into depth, or sit
  flat?_ It checks the **embodiment**, on a ladder from cheap NLP (embeddings,
  NLI, zero-shot classification) up to an LLM-as-judge. Its output is graded, so
  it **caps at `warn`** — never `fail`.

The linter sees that a link is present; only the reviewer sees whether the text
behind it means anything. A persona that links `position_female.md` but reads
with no female register passes the linter and is caught by NLP.

### Reviewer-assist — `title` vs `declared`

An instance carries two names: **`title`** is the English-facing label; **`declared`**
is the name as it stands in the source (German, for a German house). They diverge
for a common noun (`declared: "König"` → `title: "The King"`) and coincide for a
proper noun or cognate (`Rapunzel`, `Horn`). So source-language text must never sit
in `title` — only in `declared`.

A blanket `title === declared` rewrite would corrupt the proper nouns, and no script
can tell "keep" from "translate": that needs language judgment. `titleLeakAudit`
therefore **only assists** — it raises **audit** findings (never `warn`, never `fail`,
never an edit) for a human to triage, in two buckets: a title carrying a
source-language marker (the high-signal case), and a title equal to its `declared`
(mostly proper nouns, surfaced so a stray untranslated common noun is not missed).
It is wired into `validateInstanceFile`/`validateProject` and surfaces on the CLI's
`·` audit line.

### Two altitudes

The model applies wherever an engine wires (the canon's Require):

- **The law, once per world** — declared in the `khai: instructions` file:
  `{ "on": "instructions", "section": "Knowledge", "link": "anchor" }`.
- **The link, per instance** — carried by each persona:
  `{ "on": "persona", "section": "Projection", "link": "expression" }`.

### Status

Today the kit implements the **linter lane** only, at one implicit level — every
failure is `fail` (see the CLI output above). The **level** dimension
(audit/warn/fail; engine default + world override) and the **NLP-review lane**
are the target this section describes, not yet the kit's behavior.

## Licensing

- **Code** — [MIT](../khai-arch/LICENSE-CODE)
