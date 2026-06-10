# @chbrain/khai-stage

## 0.0.11

### Patch Changes

- 9e66206: Rename the blueprint's CI conformance job from `test` to `khai-tests`, the tool
  it runs, matching the `khai-guard` job's naming. A house raised from this
  blueprint must require the `khai-tests` check in its branch protection (not
  `test`).

## 0.0.10

### Patch Changes

- edb5d08: Drop `consistency` from the branch-protection handoff guidance. The audit
  workflow that posts the `consistency` status is path-filtered to `audit/**`, so
  it never reports on a non-audit PR; requiring it in branch protection wedges
  every non-audit PR in a permanent "Expected — waiting" state. The handoff now
  recommends requiring only `test`, `khai-guard`, and `branch-scope`, and says
  explicitly not to require `consistency`.

## 0.0.9

### Patch Changes

- 4e08d1e: Ship a `.prettierignore` in the house blueprint. The audit workflow commits
  machine-written `audit/*/log.md`, `ledger.json`, and `meta.json`; without an
  ignore file, a house's `prettier --check` (the `test` gate) fails the moment the
  audit bot writes a non-trivial finding. The blueprint now stamps a
  `.prettierignore` (mirroring the khai monorepo) that excludes those generated
  artifacts, and registers `.prettierignore` as a shared path in the house
  `khai-guard.config.json` so it stays lane-neutral. Every newly raised house is
  gated correctly from the start.
- f40db11: Add the management-order rider lane to the blueprint. The houses route
  `management/orders/**` as a rider (it rides the lane of the change it drives,
  homing to `governance` when it stands alone), declared in
  `khai-guard.config.json` and documented in `CLAUDE.md`. The blueprint lacked
  both, so a freshly stamped house had no rider lane. Bring the blueprint in line
  with the live houses.
- 8047cba: Sync the blueprint `khai-guard.config.json` `shared` list with the live houses.
  The blueprint only declared `.changeset/**`, `package.json`, `package-lock.json`,
  and `CHANGELOG.md` as lane-neutral, so a freshly stamped house could not edit
  `.prettierrc`, `.gitignore`, `.npmrc`, `.nvmrc`, `LICENSE`, `LICENSE-CODE`,
  `SECURITY.md`, or `registry.json` off the governance lane. The blueprint now
  shares the same set Buechner and Kleist already use.

## 0.0.8

### Patch Changes

- cfc1b4a: Harden the generated house CI/audit workflows against GitHub Actions expression
  injection. Untrusted contexts (PR branch names via `github.head_ref` and
  `steps.*.outputs.*_ref`, the PR number, and the diff-derived audit ids) are no
  longer interpolated directly into `run:` shell or `github-script` bodies; they
  are passed through `env:` and referenced as `"$VAR"` / `process.env.*`. This
  clears the code-scanning findings on every newly raised house. No behavioral
  change to the gates.

## 0.0.7

### Patch Changes

- ffdd342: Rename Manager to Theatre Manager in blueprint, tests, and generator code.

## 0.0.6

### Patch Changes

- bab315f: Rename Manager to Theatre Manager in blueprint, tests, and generator code.

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
