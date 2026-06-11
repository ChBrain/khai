# Changelog

## 0.0.4

### Patch Changes

- 183814f: Exclude the Playwright wiring guide from every tour. `findFiles` now drops
  `playwright_instructions.md` at the single chokepoint every tour path funnels
  through, so no collection glob can leak the guide into a deployed bundle. The
  guide is dev-steering (it explains an engine's model so a Playwright wires it),
  not runtime content, and never goes on tour.
- Updated dependencies [68aff20]
  - @chbrain/khai-engine-spine@0.1.4

## 0.0.3

### Patch Changes

- 447c019: Add the `khai-tour stage` CLI command and fix the `venues` listing. `stage
--venue <slug> --out <dir> [--artifact <dir>] [--collection name=glob ...]
[--engine text ...] [--format fmt]` runs the tour() orchestrator and prints the
  bundle manifest + warnings. `venues` now prints each venue's kind (and source for
  interactive venues) instead of `Format: undefined, Packaging: undefined`. The CLI
  core (parsing + presentation) lives in lib/cli.mjs so it is unit-tested.
- b4052eb: Compose deployed instructions from live spine content instead of inline fixtures.
  `compose.mjs` now reads the Prose Standard, the shared House Rules and the Venue
  adaptions from `@chbrain/khai-engine-spine`; the new `composeVenue(venue)` feeds
  that live content to the pure `composeInstructions`. The Perplexity test composes
  from real spine inputs and still reproduces the known-good deployed artifact, end
  to end. Drops the interim `HOUSE_RULES` / `VENUE_ADAPTIONS` fixtures.
- 6ae873c: Add `composeInstructions`: assemble a Venue's deployed instructions from the Prose
  Standard -- drop the H1, inject engines at Knowledge, and the shared house rules
  plus the Venue adaption at System. Proven (fixture stage) against the hand-tested
  Perplexity output. `HOUSE_RULES` and `VENUE_ADAPTIONS` are interim fixtures; a
  follow-up reads the Standard from the spine package and relocates the adaptions
  into spine/<venue>/.
- de878e4: Reclassify the Gemini Gem as an interactive venue (instructions + uploaded
  knowledge), not a publication artifact, and enforce its hard 10-file knowledge
  limit. `gemini_gem` is now `kind: interactive, source: upload` with
  `constraints.maxFiles: 10`; `buildInteractiveBundle` throws when more than the
  allowed knowledge files are produced, pointing at consolidation (one file per
  category) as the fix. Instructions do not count toward the limit.
- b7c8274: Implement the `tour()` interactive path. For a `kind: interactive` venue, `tour()`
  validates the venue, composes the deployment via `composeVenue`, aggregates the
  caller's collections, and writes the bundle as a `<venue>.zip` — root carries
  `README` / `REFERENCES` / `LICENSE` / `LICENSE-CODE` (a missing one is a warning,
  never a silent drop), the `khai/` folder carries `instructions.md` + the
  collections. Adds a dependency-free ZIP writer (`zip`, over `node:zlib`, with
  reproducible output) and the pure bundle assembler (`buildInteractiveBundle`).
  The publication path still throws a clear "not implemented yet". See docs/TOUR.md.
- 323f1f4: Implement the publication path of `tour()` with the native markdown renderer. For
  a `kind: publication` venue, `tour()` aggregates the collections, combines them
  (honouring the venue's `optimization`: `expanded` emits one artifact per
  collection, otherwise a single combined artifact in the caller's order), injects
  the generated-by metadata, and writes the artifact (zipping it when the venue's
  `packaging` is `zip`). Adds the pure `renderPublication` assembler. The pdf/html
  renderers still throw a clear "not implemented yet". See docs/TOUR.md.
- 7ee0b4c: Introduce the interactive Venue model. Venues now carry a `kind`
  (`interactive` | `publication`); interactive venues (`claude_project`,
  `perplexity_space`) also declare a `source` (`repo` | `upload`). `composeVenue`
  is keyed by venue slug (e.g. `perplexity_space`) and resolves the adaption from
  spine, with a transition-tolerant fallback to the short folder name until the
  spine folders are renamed to the slug. Adds `venuesOfKind(kind)`.
- Updated dependencies [d3dba2d]
- Updated dependencies [8a18122]
  - @chbrain/khai-engine-spine@0.1.3

## 0.0.2

### Patch Changes

- 4c81fc7: Add khai-tour package: Stage khai artifacts to distribution venues. Provides profile-driven aggregation and rendering for plays, engines, and skills tailored to audience constraints (Gemini Gem 10-file limit, GitHub Pages, print, etc.). Core modules: profiles (venue registry), aggregator (collection assembly and frontmatter stripping), and CLI. Full orchestrator and renderers (PDF, HTML, ZIP) coming next.

## [0.0.1] - 2026-06-10

### Added

- Initial bootstrap: profiles registry (5 venues: gemini_gem, github_pages, markdown, print, email)
- Aggregator module: collection assembly, glob matching, frontmatter stripping
- CLI scaffold: venues/formats info commands
- Core architecture for tour orchestration (method stubs)

### Coming Next

- PDF renderer (markdown-pdf integration)
- HTML and Markdown renderers
- ZIP packaging support
- Full tour orchestrator
- Per-play manifest support
