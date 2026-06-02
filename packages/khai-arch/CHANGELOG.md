# @chbrain/khai-arch

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
