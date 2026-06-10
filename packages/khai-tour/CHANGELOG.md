# Changelog

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
