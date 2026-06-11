# @chbrain/khai-engine-spine

## 0.1.4

### Patch Changes

- 68aff20: Add a short Playwright wiring guide to the spine engine: a `khai: instructions`
  HACKS file that points at the Roadie. Spine is the meta layer a world runs on
  (the instruction Standards, the Architecture, the Setup Plan), not a content
  domain a Playwright wires - there is nothing to link from a play; it is composed
  and toured by khai-roadie, never edited. With spine carrying its own (pointer)
  guide, the require gate needs no meta carve-out: every engine ships a
  `playwright_instructions.md`.

## 0.1.3

### Patch Changes

- d3dba2d: Ship the Venue adaptions and shared House Rules as spine content, exposed for the
  Roadie. Add `house-rules.md` (the shared runtime-output discipline merged into
  every deployed System) and `perplexity/adaption.md` (the Perplexity-specific
  delta), and export `houseRules` + `adaptions` from `index.mjs`. They are markdown
  fragments, not khai instances: spine ships them, the Roadie (khai-tour) parses
  and merges. Woven into the setup plan.
- 8a18122: Rename the venue adaption folder to the full venue slug: `perplexity/` →
  `perplexity_space/`. The `adaptions` export is now keyed by the same slug the tour
  composes for (`perplexity_space`), so there is one venue key end to end and no
  folder-to-slug mapping. Setup plan reference updated.

## 0.1.2

### Patch Changes

- cb0d807: Make the tested Prose Standard the spine's `instructions.md`. The contract grows
  to its locked quality: the richer Agent (Acts/Observes the Environment, Narrator
  bridges, "Everything is a Scene"), the capitalization rule applied (Persona,
  Scene, Environment, ...), and the Mode framework as `System` subsections (Play
  Mode, Analysis Mode), declared as allowed extensions in the manifest. The
  conditional Architecture pointer is dropped from the base (it surfaces only in a
  deployment that adds extensions). Title moves from `Raw` to `Prose`, the first of
  the Standards.
- 1a69b21: Add the spine setup plan as the engine's anchor, and retire the instructions
  flavor model. `plan_setup.md` is the master plan that routes a world into a host
  environment: it rests on the collaboration contract (the basis) and the
  architecture (the extension point), and carries one open target per host
  (Claude.ai, Perplexity, Gemini, NotebookLM, more to come), each to ship as its
  own `<host>/` folder with installation instructions and upload assets.

  Wire the two foundations together: the instructions' System chapter now points
  to the architecture seam, and the architecture's Root points back to the
  instructions. Rename `instructions_raw.md` to a single `instructions.md` (the
  basis) and drop the flavor machinery from `index.mjs` (`compose()` returns the
  one contract; `flavors`/`flavorFiles` are gone): host-specific setup is not an
  instructions flavor but a per-host folder that khai-tour assembles into a target
  deployment. Structure only, the per-host folders land in later increments.

## 0.1.1

### Patch Changes

- 97bae7f: Add the spine engine: the `class: meta` layer a world runs on -- the collaboration instructions (by flavor, starting with `raw`) and the architecture (the extension point). It ships two meta-type instances, `instructions_raw.md` (HACKS) and `architecture.md` (TO GROW), validated through the conformance kit's meta branch; `compose({ flavor })` returns the instructions for a flavor, defaulting to `raw`.
