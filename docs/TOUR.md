# khai-tour — the orchestrator

_How `tour()` stages khai work to a Venue. This is the design the implementation
PRs build against; read it before changing the pipeline._

khai-tour is the **Tour** job: it takes khai work and stages it to one **Venue**,
adapting the same material to that venue's shape. It does not author content
(spine and the engines own that) and it does not choose branches (the guard does)
— it composes and packages what already exists.

## The two kinds of Venue

A Venue declares a `kind` (see `lib/profiles.mjs`). The kind selects the pipeline:

| kind          | what it produces                                                     | examples                                       |
| ------------- | -------------------------------------------------------------------- | ---------------------------------------------- |
| `interactive` | an LLM **deployment** (instructions + knowledge), delivered as a ZIP | `claude_project`, `perplexity_space`           |
| `publication` | a rendered **artifact** (PDF/HTML/md)                                | `print`, `github_pages`, `email`, `gemini_gem` |

An interactive Venue also declares a `source` — `upload` (files dropped into the
host by hand) or `repo` (synced from a connected repository). Both produce the
same ZIP today; `source` only changes how the human installs it (and, later, how
a `repo` venue is pushed to a `khai-plays-*` repo).

`venuesOfKind(kind)` partitions the registry so `tour()` can dispatch.

## The job: aggregate → fit → format

Every tour runs three beats; each kind fills them differently.

- **aggregate** — gather the source material (`aggregateCollections` over the
  caller's globs; for interactive, also `composeVenue` for the instructions).
- **fit** — adapt to the venue's constraints (file count, ordering/optimization,
  format support).
- **format** — emit the deliverable (a ZIP bundle for interactive; a rendered,
  optionally packaged artifact for publication).

## `tour()` contract

```js
tour({
  venue,                   // slug, e.g. "perplexity_space" | "print"
  outputDir,               // where the staged result is written
  artifactDir = ".",       // root the collection globs resolve against
  collections = {},        // { name: glob | globs } — the knowledge to bundle
  engines = [],            // engine bullets injected at Knowledge (interactive)
  format,                  // publication only; defaults to venue.defaultFormat
  meta = {},               // README / REFERENCES / license source overrides
  stripFrontmatter = true,
}) => {
  venue, kind,
  outputPath,              // the ZIP (interactive) or artifact (publication)
  entries: [{ path, role }], // role: instructions | knowledge | readme | references | license | artifact
  warnings: [],
}
```

One entry point, returns a manifest of what it wrote.

## Interactive output — always a ZIP

The interactive deliverable is a single ZIP, ready to hand to the host. The
**root** carries the human/legal wrapper; the **`khai/` folder** carries the
content the user actually feeds the model:

```
<outputDir>/<venue>.zip
  README.md            # how to install this deployment (from spine/<venue>/README.md)
  REFERENCES.md        # attribution for incorporated work (the 4 L's, Starfish, ...)
  LICENSE              # khai content licence (CC-BY-NC-SA) — repo root
  LICENSE-CODE         # khai code licence (MIT) — repo root
  khai/
    instructions.md    # composeVenue(venue, { engines }) — the deployed contract
    <knowledge>...      # the aggregated collections, one file per collection
```

Rules:

- `khai/` holds **only** what the caller asked for: `instructions.md` (always)
  plus exactly the files named by `collections`. No implicit engine content —
  the caller is explicit about the knowledge it ships.
- Root files are sourced from known locations, overridable via `meta`:
  - `README.md` ← `spine/<venue>/README.md` (the per-venue install guide).
  - `LICENSE` / `LICENSE-CODE` ← the repo root, so every bundle carries the dual
    licence (content NC + code MIT), as the protection lanes require.
  - `REFERENCES.md` ← `meta.references` path (engine `REFERENCES.md` or a curated
    list). If absent, a `warnings` entry — never a silent drop of attribution.

### Why a hand-rolled ZIP

khai-tour is zero-runtime-dependency by design (the aggregator uses node's built
-in `glob`). The ZIP writer follows suit: a small store/`deflate` writer over
`node:zlib` (`deflateRawSync`) rather than an `archiver`/`jszip` dependency. ZIP's
local-file-header + central-directory format is compact enough to own; this keeps
the package dependency-free and the bundle reproducible.

## Publication output

1. `validateVenueFormat(venue, format ?? venue.defaultFormat)`.
2. `aggregateCollections` → `combineCollections`, honouring `optimization`
   (`bundled` single file · `expanded` per-collection · `curated` editorial order).
3. `injectMetadata` (profile + timestamp).
4. Render via `formats[fmt].engine`: `markdown` is native; `pdf` / `html` sit
   behind a renderer that is **stubbed with a clear "not yet" error** until PR-4.
5. `packaging: "zip"` wraps the result with the same ZIP writer.

## CLI

```
khai-tour stage --venue <slug> --out <dir> \
  [--collection <name>=<glob> ...] [--engine <text> ...] [--format <fmt>]
```

Also fix `khai-tour venues`: it prints `defaultFormat`/`packaging`, which are
`undefined` for interactive venues — switch it to show `kind` and, for
interactive, `source`.

## Validation

- Unknown venue → throw (reuse `getVenue`).
- `stage` against a `publication` venue with no `--format` → use
  `venue.defaultFormat`; an unsupported `--format` → `validateVenueFormat` throws.
- Interactive venue with no adaption in spine → compose still succeeds (Standard +
  House Rules only); add a `warnings` entry noting no venue adaption was found.

## Sequencing (small PRs, each green)

1. **`tour()` interactive path** — `validateVenue`, `composeVenue`, aggregate the
   collections, assemble the bundle tree, write the ZIP. The ZIP writer lands
   here. Tests stage `perplexity_space` to a temp dir and assert the ZIP entries.
2. **CLI `stage` command** + the `venues` print fix.
3. **Publication path** — markdown/native end to end; pdf/html renderer stubbed.
4. **Real renderers** (pdf/html) — separate PR; this is where external tooling, if
   any, enters, kept out of the core so the interactive path stays dependency-free.
