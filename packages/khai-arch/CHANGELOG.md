# @chbrain/khai-arch

## 0.1.18

### Patch Changes

- 64f5207: Add canon defaults: a per-type default set, keyed by type id, read from the
  canon's own defaults/ dir and shipped/exported as `defaults`. Ships
  defaults/pitch.md, the standard pitch registers (the tenors) to tune from. Where
  a template is the empty skeleton, a default is the filled, ready-to-tune starting
  set. This is the single source the playwright and director skills inject, so the
  pitch defaults cannot drift between them.

## 0.1.17

### Patch Changes

- a222634: Add a new element type: pitch (mnemonic TO TUNE, chapters Tenor / Undertow /
  Nerve / Echo). A pitch is the key a production is played in: the same fixed
  events tuned to one dominant tone. It is chosen for a run, not written into the
  events, so a different pitch is a different production of the same tale; a play
  may carry a default tenor and the Director may tune it to another.

  Pure canon addition: architecture/pitch.md (the spec), templates/template_pitch.md
  (the fillable skeleton), and model.md (pitch joins the cast group and the type
  list). The type registry and templates are data-driven, so no index.mjs change
  was needed; the type-rules and frontmatter gates validate the new type
  automatically (130 tests pass). This is the home of the Director's tonal register
  knob, promoted from a skill-local palette to a first-class khai type.

  (Adding a canonical type is arguably a minor; left at patch per the no-self-escalate
  rule. Apply bump:minor if the maintainer prefers.)

## 0.1.16

### Patch Changes

- 57760f3: canon: make the play `description` a required frontmatter key, and add it to
  `template_play.md`. The registry is the English-facing index (the website
  overview reads it); requiring the frontmatter `description` means the English
  logline can never silently fall back to the declared-language `## Arc`. Every
  existing play across the houses already carries the field. Pairs with khai-tests
  reading `description` from frontmatter (Arc only as a fallback).

## 0.1.15

### Patch Changes

- 79d467a: template(persona): sharpen the Taxonomy guidance on casting a Position. A seat
  named in prose stays valid (not every role is worth a file), but when a Position
  **file** exists it must be linked, `[its name](position_[name].md)`, since the
  conformance kit (castErrors) fails a Position file that no persona's Taxonomy
  claims. Closes the gap where personas were authored with a generic group line
  and left existing Position files uncast.

## 0.1.14

### Patch Changes

- 65dd38d: Declare the canon's templates under CC-BY-NC-SA-4.0, the licence the root
  LICENSE actually grants. The templates stamped `CC-BY-NC-4.0` (no ShareAlike)
  into every element generated from them, so downstream houses inherited a
  content licence weaker than the one khai declares; new elements now carry the
  SA clause from the start. Existing house content is re-declared separately,
  house by house.
- db6e497: Tighten the Taxonomy guidance in the element templates (position, process, piece,
  place, persona, plan). The slot is the classification slot: the group directly
  above this element, named and linked if it has its own file. The guidance was a
  chatty paragraph that invited equally chatty fills; it is now a terse one-liner
  naming the immediate parent and the link rule, with the reminder that the slot is
  not the element's own name (the H1) or its origin (Owner). Every house and skill
  that pulls the canon templates inherits the terser slot on the next bump.

## 0.1.13

### Patch Changes

- ea7ae45: Correct the closed-plan verdict vocabulary. `[?]` flagged read as "not yet
  judged", which contradicts `closed` (every target resolved). Replace it with two
  genuinely terminal verdicts: `planVerdicts` is now `[x]` done, `[F]` failed,
  `[W]` waived (a live target dropped or overtaken by events), and `[-]` struck
  (cut as moot or never applicable). The template and architecture note spell the
  same set.
- 9c8c56a: Tighten the `planVerdicts` doc: the verdict vocabulary applies to every resolved
  (non-open) target on any plan, whatever its status, not only a closed one.
  Completion is the separate, status-gated rule (a plan is `closed` only when no
  open `[ ]` remains; a draft/active plan may keep open targets).

## 0.1.12

### Patch Changes

- 0ad27c2: Make the plan-target verdict vocabulary canon. Export `planVerdicts`
  (`[x]` done, `[F]` failed, `[?]` flagged) as the single source, and spell the
  same set in `template_plan.md` and `architecture/plan.md` (the former `[W]`
  waived becomes `[?]` flagged). The conformance kit pulls this export instead of
  restating the rule.

## 0.1.11

### Patch Changes

- 91b3c98: Teach the plan Owner taxonomy. A plan is directed intent toward a subject, and
  the Owner is that subject: it can be a persona (a personal scheme), a position
  (a mandate, where the office acts not the person), a process (a method), a place
  (a development), a piece (a making), or the project (a production directive). The
  Owner sets the kind of plan; the agents who carry it out are named in Orders, not
  the Owner. `template_plan.md`'s Taxonomy and Owner guidance now carry the full
  set. A plan commands other elements by reference, it never copies them, so
  several plans may command one process without duplication.

## 0.1.10

### Patch Changes

- 4c0b468: Teach the plan Targets vocabulary. A target carries a verdict, and "resolved"
  means a verdict was reached, not that it succeeded: `[ ]` is open (no verdict
  yet, the live edge; a closed plan has none), `[x]` done, `[F]` failed, `[W]`
  waived. A closed plan may carry failed targets. `template_plan.md` now documents
  the four markers with a worked mix, and the `plan` spec's Targets line reads
  "each carrying a verdict (done, failed, or waived); resolved when none is left
  open" instead of "must be completed". The gate is unchanged (only `[ ]` blocks).

## 0.1.9

### Patch Changes

- e1f577e: Publish every architecture type: flip the remaining `status: draft` specs
  (architecture, engines, instructions, order, persona, piece, place, play, plot,
  position, process) to `status: published`, so none of the canon types is left
  in draft.

  Also fix the `plan` coda, which was scoped to a management plan only ("before
  it can be merged to main"). A plan may be a production directive or an in-world
  plan, so the completion rule must be scope-agnostic: "A plan is completed when
  all its directives are resolved: no pending `[ ]` targets remain."

## 0.1.8

### Patch Changes

- ae0c95e: referenceCard / playCard / planCard / orderCard now peel the optional trailing
  `---` coda correctly. They previously split on the first `\n---\n` and treated
  everything after it as coda, so a legal `---` thematic rule inside a chapter
  body (or a `---` inside a fenced code block, e.g. a YAML example) truncated the
  document and dropped every later chapter, throwing a misleading "chapters must
  be exactly […]" on a valid document. A shared fence-aware helper now finds the
  coda only at a trailing `---` rule that has no chapter heading after it.
- 9965037: The card extractors (referenceCard / playCard / planCard / orderCard) now split
  chapters fence-aware and closed-ATX-aware, matching parseDoc. They re-scanned
  raw text with `main.split(/\n(?=## )/)` and a leading-only name strip, so a
  `## ` or `### ` shown inside a fenced code block in a chapter body (e.g. a YAML
  example) became a phantom chapter that failed the exact-chapters contract on a
  valid document, and a closed-ATX chapter heading (`## Origin ##`) produced the
  name "Origin ##" and mismatched the canon. A shared fence-aware parseChapters
  helper (reusing the existing fencedLines) now drives all four, and chapter and
  subchapter names drop a trailing closed-ATX run.
- 11425ea: The `templates` export now skips a template file whose frontmatter lacks a
  `khai` key instead of keying it on `undefined` (which would collapse every such
  file onto a single entry), and parses each file once instead of twice. Behavior
  is unchanged for canon templates, which all declare `khai`.

## 0.1.7

### Patch Changes

- 4178749: Widen the plan spec and template to support positions, personas, and roles as owners and order targets.

## 0.1.6

### Patch Changes

- 7cd2eda: Introduce `plan` type (TO DOIT) spec, templates, and card extraction, exporting `planCard` and `planChapters`. Kept `orderCard` and `orderChapters` as deprecated aliases for backwards compatibility.

## 0.1.5

### Patch Changes

- 8435643: arch: define order (DOIT) spec and playCard implementation

## 0.1.4

### Patch Changes

- d4c3079: Add the optional `voice` string field to type definitions and frontmatter schema.

## 0.1.3

### Patch Changes

- c5cb182: Align every content template's H1 and `title` placeholders on `[title]` (was
  `[name]`). The H1 (`# Type: [title]`) and the frontmatter `title:` now use one
  word, so the echo between them is self-evident in the scaffold an author copies.
- 7dc7952: Rewrite the play template's `## Estate` chapter: the production may be given as
  a free name, or - preferred - a named repository with a deep link to it. Aligns
  the chapter with the delivery model, where a production lives in its own
  external `khai-plays-*` repo.
- 6bffe4e: Add `title: "[name]"` to every content template's frontmatter, modelling the
  declared-title shape authors now follow (the H1 name, mirrored in frontmatter).

## 0.1.2

### Patch Changes

- 9d0674d: Move playbookTagline source from model.md yaml block to package.json khai.tagline, consistent with khai-methods and khai-skills. model.md stays pure architecture.
- d2307ba: Add `playbookTagline` export, sourced from a new `tagline` key in model.md's playbook block, so a consumer surface can print the canon's own description of the playbook verbatim instead of authoring its own copy.

## 0.1.1

### Patch Changes

- 62db379: arch(play): split builder instructions out of the rendered coda

  The play.md coda carried a mix of reader description and authoring
  guidance ("a play carries no generic ## Owner or ## Taxonomy prefix ...
  adding Owner or a Title back is not a fix but a break"). Builder
  instructions belong in the template layer (never rendered), not in the
  spec the website renders.

  Rendered coda now matches the pattern every other type uses: pair labels
  - "A [type] file succeeds when ...". The non-TO constraint and mnemonic
    discipline move to a trailing builder note in template_play.md.

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

- 95f4264: Add the house-type authoring templates: `plot` (CAST: Cue / Action / Stage /
  Tension) and `play` (ENACTS: Estate / Name / Arc / Company / Triggers / Stakes),
  authored fresh from the canon specs. Friction-first like the element set: plot's
  test lives in Tension (no Tension, no plot), play's in Stakes (stakes that never
  move are no stakes).

  Both conform to the section contract: `plot` is a TO-type, so it carries the
  `Taxonomy` (the group above -- the Play it sits within) / `Owner` prefix ahead of
  its chapters; `play` is non-TO (ENACTS does not begin with "TO "), so it carries
  no generic prefix at all -- `Estate` (whose) and `Name` (what it is called) are
  its own first two chapters, not a re-name of the standard Owner/Title. This
  settles the earlier overlap question: there is no Owner/Title to collide with.

- 34c6d7b: khai-arch's encoding test pulls `checkEncoding` from `@chbrain/khai-rules`
  instead of reimplementing it (BOM/em-dash/replacement-char constants and the
  `assertEncodingOk` helper removed). No change to the canon content; the only
  published delta is the added devDependency.
- 2d29311: Persona `type:` field. The canon declares `frontmatterExtras(persona) = { type:
[real, archetype, fictional] }` (its real-world exposure class: Real carries
  legal/reputational exposure, Archetype is drawn from life but anonymised,
  Fictional is invented), and the persona template gains `type: fictional`. The
  kit (already shipped) pulls this and enforces the enum.
- 67e7925: Persona `type:` is now required. `frontmatterExtras(persona)` declares
  `{ type: { values: [real, archetype, fictional], required: true } }`, so every
  persona must state its real-world exposure class. The template and the kit's
  fixture personas already declare it; a persona without `type:` now fails
  validation ("missing required key: type").
- 7ebebf0: Add authoring templates for the element types under `templates/`, one fillable
  skeleton per type, each a valid content instance (proven by khai-tests). Section
  guidance is friction-first: every chapter carries a self-test, and relational
  sections add a modeling checkpoint ("link it where it already has a file; where
  it does not, ask whether it should use a khai type"). Expose a `templates`
  accessor on the canon (keyed by type id) and ship the `templates/` dir.
- 1996d77: Title -> Taxonomy: the canon side. The "T" of a "TO \_\_\_" type is the group
  above (what the file is one of), not a re-name of the H1. The canon now declares
  the prefix vocabulary through `toPrefix(typeId)` (the single source the kit
  pulls), and the five house templates (persona, position, process, piece, place)
  carry a `## Taxonomy` section in place of the dead `## Title` echo. Its guidance
  is question-shaped friction, never a hard link: name the group above, then ask
  whether it already has a khai file (link it), or whether it should (a gap to
  build). Owner stays the origin stamp.

  Also corrects `architecture` from `GROW` to `TO GROW`: it is a TO-type (it grows
  from the canon above it), so it carries the Taxonomy/Owner prefix. The chapters
  still spell GROW, so the mnemonic lock is unaffected. Fixes the process template
  Direction note to point a child process at its parent through Taxonomy, not
  Owner.

## 0.0.10

### Patch Changes

- e4d7aef: Canon voice: the canon now practices the house voice it asks of engines. The
  " - " clause dash is gone from the type prose ( , ; : () instead): 15
  occurrences across engines.md, architecture.md, model.md, and play.md. Prose
  only, no contract change (chapters, mnemonics, and type rules are unchanged).
- cebda9f: `renderEngineReadme` now emits the house voice. The Files list uses `:` instead
  of `" - "` (`[gender](position_gender.md): position (anchor)`), the pointer prose
  drops its clause dash ("generated, not edited by hand"), and an em/en-dash in a
  fallback tagline normalizes to a comma rather than `" - "`. The generator no
  longer produces a mark the standard bans.

## 0.0.9

### Patch Changes

- 9f0dc51: Realize the generalized WIRE in code: an engine is a set of typed members on a
  composition tree, not a single-type anchor + flat expressions.
  - `engineMembers(manifest)` - normalize a manifest into `{ file, type, parent }[]`.
    Two shapes desugar to the same model: the explicit `members` list, and the
    legacy `{ type, anchor, expressions }` shorthand (so existing engines are
    unchanged). Validates types against the canon, one root, resolvable parents,
    no cycles.
  - `compositionOrder(manifest)` - the "carry upward" rule made concrete: for each
    leaf, the ordered file chain from root to leaf. Depth-1 engines yield
    `[anchor, expression]`; a ladder yields `[root, channel, width]`.
  - `engineCard` now derives `type`/`anchor` from the root member when an engine
    declares `members` (explicit fields still win), so a members-based engine
    still renders a complete card. Return shape is otherwise unchanged - the
    website card loader is unaffected.

- abf5cdb: Add `renderEngineReadme(pkg)`: the canon-owned generator for an engine's README.
  The README becomes a generated pointer - title, tagline (`khai.tagline`, else
  the package `description`), the member files (from
  the composition tree, root marked as the anchor), and where the real sources of
  truth live (the manifest / WIRES card and REFERENCES.md) - never a second copy
  of the card. Em/en-dashes in the tagline are normalized to the sanctioned
  " - ". This is the first half of the engine-package docs standard; the kit will
  regenerate-and-diff so a README can never drift from its manifest.

## 0.0.8

### Patch Changes

- 1fd1552: Engines: introduce the WIRES card. khai-arch gains `engineCard(manifest)` and
  `wiresChapters` - the engine-instance contract (Wire, Issue, Require, Enforce +
  Setup), derived from the engines type so it can never drift from the definition.
  The gender engine authors its `khai.card` (the five WIRES chapters), so a
  consumer can render the engine as a card under the playbook's "enriched by"
  group. khai-arch owns the schema; @chbrain/khai-tests will enforce it.

## 0.0.7

### Patch Changes

- f34d674: Typography: replace the 13 prose double-hyphens (`--`) in the canon with
  the sanctioned spaced hyphen (`-`). Markdown smartypants rendered `--`
  as an en-dash, slipping an en-dash-in-disguise past the CVI; the canon is
  ASCII-only (see encoding.test.ts: em-dash forbidden, use `-`). Affects
  play, engines, architecture, and model. Structure (frontmatter fences,
  coda separators, the model table rule) is untouched.

## 0.0.6

### Patch Changes

- e3fc4d4: Add Play (ENACTS) and move the playbook's structure into the canon.
  - **play.md**: a new `house`-class type. ENACTS -- Estate, Name, Arc, Company,
    Triggers, Stakes -- the production that holds the plots: one Company they draw
    from, Triggers that chain them, an Arc they interweave on, and the Stakes they
    raise. Sits above Plot in the canon.
  - **plot.md**: `class: system -> house`. Play and Plot are peers in `house`;
    "system" is retired as a classifier.
  - **model.md** now owns the playbook spine: a `groups` block (production, cast,
    rests on, enriched by) that consumers render instead of re-declaring.
    `index.mjs` exports it as `playbook`.
  - **\_schema.yml**: class enum `system -> house`; the mnemonic form is no longer
    tied to class (Play is `house` with a bare ENACTS).

## 0.0.5

### Patch Changes

- dbb3892: Add `engines` as the ninth typed spec and fix the architecture subtitle.
  - **engines.md (WIRE)**: a new meta-class type for the extensions builders wire
    into the architecture seam. Chapters Wire / Issue / Require / Enforce cover
    where an engine attaches, what it offers, the contract it imposes on its host,
    and the test guarantee it owns. Sits alongside architecture (the seam) and
    instructions (the method) as canon substrate.
  - **architecture.md**: subtitle "the growing of the world" -> "the growing of
    worlds" to keep the "the X-ing of <bare noun>" beat the other specs share
    (forces, conditions, forms ...); the article in "the world" was the odd one
    out.
  - **instructions.md**: drop the System chapter's `[Architecture](architecture.md)`
    link -- the only hard link in the canon. It rendered as a dead relative URL on
    the site, and the cross-reference is redundant now that architecture.md and
    engines.md are self-describing specs the Agent reads directly. The canon is
    now link-free.
  - Companion + schema housekeeping: model.md lists Engines and stops calling
    Architecture "this document" (stale since the GROW rename); \_schema.yml and
    the README reflect nine typed specs.

## 0.0.4

### Patch Changes

- b8549f6: Publish the GROW restructure that 0.0.3 documented but never shipped. The
  `0.0.3` tarball on the registry still carries the pre-GROW files: the old
  overview as `architecture.md` (no frontmatter, no coda) and no `model.md`.
  The source moved to the GROW typed spec (`architecture.md` as the Ground/
  Root/Open/Weave seam, overview relocated to `model.md`) without a version
  bump, so consumers installing `khai-arch` got stale canon. This patch
  republishes the canon so the registry matches source: `architecture.md` is
  the typed seam and `model.md` is the companion.

## 0.0.3

### Patch Changes

- 4a679b6: Add a machine-readable contract export (`types`, `chaptersFor`), read at
  runtime from the canon's own type-definition frontmatter. Conformance tooling
  derives the section contract from this instead of restating it, so the rules
  can never drift from the definitions.

- Add `architecture` as a typed spec (GROW: Ground, Root, Open, Weave) — the
  canon's one deliberately-open type, the extension seam through which builders
  attach engines, content, and extensions without editing the canon. The former
  overview doc moves to `model.md` (the companion). `instructions.md` keeps its
  System chapter pointed at `architecture.md`, so the Agent reads the seam to
  find where extensions attach. Brings the canon to eight typed specs plus one
  companion.
