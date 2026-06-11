# khai-tour

**Stage plays and khai artifacts to their venues.**

Adapt khai work (plays, engines, skills, methods) to distribution profiles with audience-specific constraints and formats.

## Concept

After a play is **staged** (via `khai-stage`), it goes **on tour** to different venues, each with its own constraints and audiences:

```
Stage (set up production)
  ↓
Play (ready to go)
  ↓
Tour (send to venues with their constraints)
  ├─ Gemini Gem (10-file limit) → compact PDF in ZIP
  ├─ GitHub Pages (unlimited)  → expanded HTML site
  ├─ Print (editorial)          → print-ready PDF
  └─ Email (size limit)         → compressed ZIP
```

Each venue is a **profile** - the same play, adapted for where it's being experienced.

## Venues

### `gemini_gem`

Google Gemini context artifact (10-file limit). Optimizes as single bundled PDF in ZIP.

### `github_pages`

Hosted static site (unlimited files). Expands into separate HTML files per collection.

### `markdown`

Portable markdown (single file). Use for local/portable sharing.

### `print`

Print-ready PDF (editorial ordering). Single curated PDF optimized for paper.

### `email`

Email transmission (25MB limit). Compressed, optimized for email attachment.

## Usage

### As a library

```javascript
import { aggregator, venues, formats } from "@chbrain/khai-tour";

// Aggregate a collection
const collections = {
  personas: "persona_*.md",
  pieces: "piece_*.md",
  places: "place_*.md",
};

const aggregated = await aggregator.aggregateCollections(
  "./plays/woyzeck",
  collections,
  true, // stripFrontmatter
);

// Now pass to renderer (when implemented)
// const tour = await tourOrchestratorRender(aggregated, 'gemini_gem');
```

### CLI (preview)

```bash
khai-tour venues    # List available venues
khai-tour formats   # List available output formats
```

## Full tour pipeline (coming soon)

- [ ] PDF renderer (via `markdown-pdf`)
- [ ] HTML renderer
- [ ] ZIP packaging
- [ ] Orchestrator that chains aggregation → rendering → packaging
- [ ] Per-play manifest support (declare which profiles to build)

## Architecture

- **`profiles.mjs`**: Venue definitions and format specs
- **`aggregator.mjs`**: Collection assembly, frontmatter stripping, content combining
- **`renderers/`** (coming): Format-specific rendering (PDF, HTML, Markdown)
- **`index.mjs`**: Main export and tour orchestrator

## License

Code: MIT (`LICENSE-CODE`)  
Content: CC-BY-NC-SA 4.0 (`LICENSE`)
