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

### Delivery walls — the manifest, the release, and the box

Three checks a house does not author twice because they are not about content:
they hold a house's own delivery machinery to what it claims about itself.

**`gates verify-ci`** — the `gates` array in `khai-guard.config.json` and the CI
workflow's own job ids, held to a one-to-one correspondence. A `gates` array a
house hand-maintains is a second copy of what the workflow already says, and a
manifest that quietly falls behind `ci.yml` passes every local `npm run gates`
right up until CI runs a job nothing local ever checked. The match: strip a
leading `khai-` and every non-alphanumeric, lowercase, compare — `khai-branch-
scope` reads as `branchscope` against a gate named `branch-scope`. Where the
name does not fall out on its own, `ciPolicy` in `khai-guard.config.json` says
so: `only` for a job with no local equivalent to run (a hosted scan, a release
step gated on a secret), `split` for one job that runs several gates as steps
(`{"khai-tests": ["prettier", "suite"]}`), and a gate's own `job` field, which
wins over the name match. `workflow` overrides the default
`.github/workflows/ci.yml`.

```bash
npx khai-tests gates verify-ci   # exit 1 on a job with no gate, or a gate with no job
```

**`release verify`** — pins the release workflow to the inputs
`changesets/action@v2` actually reads. A dependabot bump once renamed those
inputs (`version` → `version-script`, `publish` → `publish-script`); the action
refuses to run under the old names, `npm test` stays green because the failure
sits in the last step of a job whose visible work all passes, and the only
symptom is that a release never appears. Checks the `with:` block names real npm
scripts under the v2 names, `github-token:` comes from a secret, and no
`GITHUB_TOKEN` env var sits beside it on that step (the action reads the input;
an env token there silently wins and is the wrong token).

```bash
npx khai-tests release verify   # exit 1 if the changesets step is misconfigured
```

**`packing verify`** — registry.json's promise held against the tarball,
package by package. An entry with no `package` field is that package's own to
ship, so its anchor file must be in the box; an entry that names a `package` has
moved there, so it must be a declared dependency and gone from this tarball.
Governance never ships from anywhere: `tests/**`, `.husky/**`, `.github/**`,
`khai-guard.config.json`, and the vendor instruction files. Works whether or not
a house has taken the workspace shape — a flat house (root package.json IS the
content package) is packed the one way npm allows a repo with no `workspaces`
field to be asked. Distinct from `pack`, which packages one conforming engine
into a zip.

````bash
npx khai-tests packing verify   # exit 1 on an unshipped anchor, a leak, or an empty registry

### Science keying walls: checks on the index's OWN key computation

The instruments above ask whether a piece of science is shared. These ask a
narrower question: did the index compute the right key at all? Two are walls
(exit 1 on a computed defect, never on nothing); three are probes (report and
always exit 0, because what they find is a reading list for a person, not a
verdict a script can make).

- **`forms`**: a declared `scholarPolicy.homonyms` form that is a
  space-prefix of a LATER form in the same array (`["David", "David L"]`)
  reads, to a maintainer, as unreachable first-match order, though the build
  itself resolves by longest match, order-independently, so this is a
  declaration hygiene wall, not a live-defect one. The fix is always a
  reorder, longest form first.
- **`suffixes`**: an index key whose whole surname is a generational suffix
  (Jr, Sr, II, III, IV). The build already strips a trailing suffix before
  taking the surname, so this only ever catches a Source cell that names a
  suffix and no person at all; drop the suffix and add the name.
- **`opposed`**: the axis/opposition wall. A unit's warrant (its
  `REFERENCE.md` or `REFERENCES.md`) may declare, in YAML frontmatter, the
  quantity it acts on and the sign of the outcome's response to an increase in
  it:

  ```yaml
  ---
  axis: population-density
  sign: negative # how the outcome moves as that quantity rises
  ---
````

Two units on one axis with opposite signs are in conflict and must each name
the other (by title) somewhere in their own warrant text. `opposed` fails on
a malformed declaration (an axis without a sign, a sign without an axis, or
a sign that is neither `positive` nor `negative`, never grandfathered, since
a half-written declaration reads as covered and checks nothing) and on an
opposed pair that does not name each other both ways. Unit discovery reads
the same collection a house declares in `khai.collection` (default
`plays/`); a root with no such collection reports zero units, cleanly.

- **`probe`**: three read-only instruments in one pass: an **undeclared
  namesake** (a surname not yet in `scholarPolicy.homonyms` whose own Source
  cells already name more than one given name), **mixed cells** (the
  complement, an undeclared surname mixing a named cell with a bare one,
  where a namesake the first probe cannot see would be hiding), and
  **compound works** (a Key Work cell hiding a second work behind a
  semicolon, since the index only ever reads the first, that collides with a
  work another unit already holds as its first work, minus the same
  `canon`/`contrastMarkers`/`supportingMarkers` exemptions `overlap` reads).

```bash
npx khai-tests science forms      # declared homonym forms in a misleading order; exit 1 on findings
npx khai-tests science suffixes   # index keys that are a generational suffix; exit 1 on findings
npx khai-tests science opposed    # the axis/opposition wall; exit 1 on a malformed or silent pair
npx khai-tests science probe      # undeclared namesakes, mixed cells, hidden compound works; exits 0
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
- `verifyGatesAgainstCi(root)` / `renderCiCheck(findings)` — the gates manifest
  held against the CI workflow's job ids.
- `verifyRelease(root, { workflow })` / `renderRelease(findings)` — the release
  workflow held to the changesets v2 input names.
- `checkRegistryPacking(root, packed)` / `renderRegistryPacking(findings)` —
  registry.json held against the tarball; pair with `packedFilesAny(root)`,
  which packs a flat house the same way `packedFiles` packs a workspace one.
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
