# NLP Review — Architecture

The NLP review is the semantic layer above the structural conformance kit
(`khai-tests`). Where `khai-tests` checks that the architecture is followed —
the right sections are present, the right links are made — the NLP review checks
that the prose is good: lean, coherent, and true to its declared voice.

It never gates. A structural failure breaks CI; an NLP finding is a suggestion
that a human treats in a comment thread. The gate is the conversation, not the
model.

## Escalation of concerns

Three layers, each narrower than the one above:

1. **Structural** (`khai-tests`) — deterministic, binary, cheap. Does the file
   conform to its khai type? Are the required links present? Runs on every push.
2. **Semantic** (`khai-review`) — a model judge, advisory, expensive. Is the
   prose lean? Does it conform to the declared voice? Triggered sparingly.
3. **Human** — the treatment layer. A finding is a risk; the human accepts,
   reduces, or transfers it. The consistency gate checks that the table and the
   comment threads agree.

## Rubrics

A rubric is a named criterion the judge applies. Adding a check is adding a
rubric — data, not code. The judge is injected, so the harness tests without a
model.

Rubrics in use:

| Rubric              | Scope            | What it checks                                                                                                    |
| ------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| `conciseness`       | universal        | at least a quarter of a passage could go with no loss of meaning                                                  |
| `khai-type`         | universal        | the prose actually does the job the section demands (e.g. Shadow contradicts Projection rather than restating it) |
| `voice-conformance` | per content unit | the prose conforms to the voice the file declares                                                                 |

`voice-conformance` is parameterised at runtime: the harness reads the effective
voice declaration for the file under review and builds the rubric instruction from
it. The rubric is data, not code.

## Voice: the override chain

Every khai content file may declare its voice in YAML frontmatter:

```yaml
voice: "sparse and clinical; working-class register; colon and semicolon, never a dash"
```

The effective voice for any given file is resolved by walking up:

```
repo README.md  (house voice — the base)
  └── play file  (play voice — overrides house)
        └── element file  (file voice — overrides play)
```

The most specific declaration wins. A level with no `voice` field inherits from
the level above. No declaration anywhere means no brief — the harness skips the
`voice-conformance` rubric for that file and warns.

House voice is authored when the house is raised (khai-impresario); play voice
when the play is raised (khai-playwright). A play voice is specific to the
production — Woyzeck's stripped clinical cadence is not the voice of Leonce and
Lena, even within the same Buechner house. Element files may further narrow the
voice, because a persona or a place has its own register within the play: the
Captain's files are wordier than Woyzeck's because he is, and that verbosity is
not padding.

### CVI

The `voice` field is also read by the website's CVI (Creative Visual Identity).
CVI does not declare its own voice; it reads the `voice` field from the content
package it is rendering and instantiates the appropriate presentation from it.
The content self-describes once; both the reviewer and the renderer pick it up.

## Trigger pattern

The model call is expensive. The review job fires only on:

- PR open / reopen
- `/audit <id>` comment (on-demand)
- Manual dispatch

Every subsequent push runs the cheap `consistency` job instead: no model calls,
only the deterministic ledger-vs-comments check. The gate stays live cheaply.

## Audit manifests

An audit is declared in `audit/<id>/audit.json`:

```json
{
  "id": "woyzeck-conciseness",
  "review": { "rubrics": ["conciseness"], "targets": ["plays/woyzeck"] }
}
```

A house may run several audits in parallel — one per rubric, or one per scope.
The collector deduplicates findings across runs; each finding lives in exactly
one ledger.

## Current state and what is still to build

The harness is implemented and tested. The `conciseness` rubric is the only one
defined. The CLI reads engine `khai.card` chapters only; it does not yet read H2
section bodies from markdown files.

What remains:

- **Markdown input path** in the CLI: extract H2 section bodies from `.md` files
  as review targets alongside card chapters.
- **`khai-type` rubric**: a per-section-type criterion defined once and applied
  universally.
- **`voice-conformance` rubric**: parameterised from the `voice` field, resolved
  via the override chain at review time.
- **`voice` field** in the khai-arch type definitions: recognised frontmatter
  field so the conformance kit can require its presence.
- **khai-stage blueprint update**: stamp `@chbrain/khai-review` as a dependency,
  seed `audit/` manifests for each rubric, and add `audit.yml` to the house CI.
  The impresario and playwright skills guide the voice authoring step.

## Build-out path

Ordered instructions for the session that picks this up. Each step is one PR.
Follow CLAUDE.md: run `npx khai-guard branch <topic>` to derive the branch —
never type a branch name by hand. Every PR needs a changeset (empty if no
package change ships). Never `--no-verify`. Never merge.

### Step 1 — Assign a lane to `packages/khai-review/**` _(governance lane)_

`packages/khai-review/**` currently has no owning lane in
`khai-guard.config.json`. Until it does, `npx khai-guard branch` will refuse any
change to it.

Files to change: `khai-guard.config.json` (add `review/*` pattern to
`branchScope.lanes` covering `packages/khai-review/**`).

Use `governance/<topic>` for this PR because it modifies the guard config. After
merging, `npx khai-guard advise --files packages/khai-review/index.mjs` should
resolve to `review/<topic>`.

> Empty changeset — no package ships.

### Step 2 — Markdown input path _(review lane)_

Teach the CLI to read H2 section bodies from `.md` files as review targets,
alongside the existing engine `khai.card` chapter path.

Files to change: `packages/khai-review/index.mjs` (or the relevant source file
— read the package first to find the entry point and input-extraction code).

Source and tests are separate PRs (CLAUDE.md rule 3). This PR changes source
only. Tests follow in a subsequent PR once source lands.

> Changeset: patch bump on `@chbrain/khai-review`.

### Step 3 — `voice` field in khai-arch _(arch lane)_

Add the optional `voice` string field to the khai type definitions so it is
recognised frontmatter rather than freeform YAML. The conformance kit can then
require its presence and the reviewer can rely on it.

Files to change: `packages/khai-arch/**` (find the type definitions — likely the
`.mjs` schema files — and add `voice` as an optional string).

> Changeset: patch bump on `@chbrain/khai-arch`.

### Step 4 — `khai-type` rubric _(review lane)_

Add the `khai-type` rubric: a per-section-type criterion that checks whether the
prose actually fulfils the section's job (e.g. a Shadow section must contradict
the Projection, not restate it). Define the rubric as a data entry — a named
criterion with a prompt instruction — following the pattern of the existing
`conciseness` rubric. Do not add a model call; the harness already injects the
judge.

Files to change: `packages/khai-review/**` (rubric definitions, not the harness
itself).

> Changeset: patch bump on `@chbrain/khai-review`.

### Step 5 — `voice-conformance` rubric _(review lane)_

Add the `voice-conformance` rubric. It is parameterised: at review time the
harness walks the override chain (repo README → play file → element file),
resolves the effective `voice` declaration, and builds the rubric instruction
from it. Files with no `voice` anywhere in their chain are skipped with a
warning, not an error.

Files to change: `packages/khai-review/**` (rubric definition + the chain-
resolution logic in the harness).

This step depends on Step 3 (the `voice` field must be recognised before the
harness can rely on it being present).

> Changeset: patch bump on `@chbrain/khai-review`.

### Step 6 — khai-stage blueprint update _(stage lane)_

Wire khai-review into every future house stamped by khai-stage:

- Add `@chbrain/khai-review` to the blueprint's `devDependencies`.
- Add `audit.yml` to `blueprint/.github/workflows/`: fires on PR open, runs
  `khai-review audit` against the changed files, posts findings as a PR comment.
- Seed `blueprint/audit/` with one manifest per rubric (`conciseness`,
  `khai-type`, `voice-conformance`).
- Update the impresario and playwright skill guides to include a voice-authoring
  step: the impresario sets house voice in `README.md`, the playwright sets play
  voice in the play file.

Files to change: `packages/khai-stage/blueprint/**` and
`packages/khai-stage/index.mjs` if the handoffs array needs updating.

> Changeset: patch bump on `@chbrain/khai-stage`.

### Step 7 — Wire khai-plays-buechner _(in `khai-plays-buechner`, play lane)_

After Step 6 lands, retrofit the Buechner house to match what new houses get:

- Add `voice` fields to `README.md` (house voice), `plays/woyzeck/play_woyzeck.md`
  (play voice), and the element files where a distinct register is intentional
  (e.g. `persona_the_captain.md` — wordier; `persona_woyzeck.md` — stripped).
- Add `audit/` manifests mirroring the blueprint seeds.
- Add `audit.yml` to `.github/workflows/`.

This is a `play/*` branch in `khai-plays-buechner`. Use
`npx khai-guard branch add-nlp-review` there.
