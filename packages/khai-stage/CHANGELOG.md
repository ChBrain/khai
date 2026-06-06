# @chbrain/khai-stage

## 0.0.5

### Patch Changes

- fa8a028: Add standard Playwright position and template persona to the house blueprint. Rename playwright persona file dynamically on stamp.

## 0.0.4

### Patch Changes

- 1f13fec: Add standard Manager position, local copies of Choregos, Nicias, and Pericles, and a GEMINI.md template to the house blueprint. Rename manager persona file dynamically on stamp.

## 0.0.3

### Patch Changes

- 584a426: Align house blueprint governance settings: add changeset-release branch scope lane, allow REFERENCE.md and REFERENCES.md in the governance lane, add default REFERENCE.md template with generic language policy, and update the audit workflow to be advisory.

## 0.0.2

### Patch Changes

- 1a38f75: Fix blueprint directory structure: rename `github/` to `.github/` so generated house scaffolds have workflows in the correct location for GitHub Actions discovery.
- e55cbfe: Fix Windows path separator handling in blueprint stamper. The housePath() function normalizes paths before checking for dotfile patterns (github/ → .github/, husky/ → .husky/). On Windows, path.relative() returns backslashes which failed the startsWith() check.
- 2f8b435: Make stamped houses publishable. The blueprint now carries a `files` field, `version`/`release` scripts, and a `release.yml` workflow, so a freshly raised house ships to GitHub Packages without hand-wiring. Also fixes the changeset config restoring to `changeset/` instead of `.changeset/`: `housePath` now dots the `changeset/` prefix like `.github/` and `.husky/`. Adds RELEASE_TOKEN to the post-stamp handoffs.
- 20eb889: Add prettier configuration to khai-stage blueprint and format blueprint files. Every generated house now inherits the standard prettier config (print width 100) and is formatted consistently, ensuring generated houses pass CI `prettier --check` on first run.

  Fixes: khai-guard.config.json array wrapping, tests/house.test.mjs arrow chain wrapping, and missing .prettierrc.

- ec0f427: Wire @chbrain/khai-review into the house blueprint: add the devDependency, declare target metadata, add the audit workflow, and seed audit manifests.

## 0.0.1

### Patch Changes

- ace097d: Add khai-stage: the codified house blueprint and its init. `khai-stage <source>`
  stamps a khai-plays-<source> production house deterministically, the four pillars
  wired, the gates set, both faces of protection installed, the README minted as
  the house's Estate identity, and a conformance test that is green on an empty
  house and validates plays as they land. The invariant is computed here so it
  cannot drift between houses; the source is the only hole filled. The
  khai-impresario skill conducts and judges the source; this stamps.
