# @chbrain/khai-stage

## 0.0.17

### Patch Changes

- 48072ec: Blueprint: add `.github/copilot-instructions.md` so the Copilot staging agent gets the house contract — most importantly that **a play takes no changeset** (the build sets `0.<count>.0`). Without it, Copilot had no house guidance and added a changeset per play, producing the `0.<count>.1` drift. Mirrors `CLAUDE.md`.
- 1d51aab: Stage template now ships and exports `registry.json`. `index.mjs` already writes
  a `registry.json` into every raised house, but the blueprint `package.json.tmpl`
  left it out of `files` and declared no `exports` — so every house published
  without it, forcing consumers (e.g. the website loader) onto the deprecated `##
Arc` markdown fallback. Add `registry.json` to `files` and an `exports` map
  (`.`, `./package.json`, `./registry.json`), matching the houses that were fixed
  by hand. Future houses now ship the registry by default.
- a50fb75: Stamp the Director into every house. The stage blueprint now carries
  `position_director`, `plan_stage_the_score`, and a per-house
  `persona_director.md.tmpl`; `index.mjs` fills the `{{DIRECTOR_*}}` tokens and
  renames the persona per house (a new optional `director` arg, default `director`).
  New and synced houses are born with the Director, matching the chain reference cast.

## 0.0.16

### Patch Changes

- 2a875ac: Blueprint: add a `dependabot/*` branch lane to `khai-guard.config.json`, allowing the dependency-update file set (`package.json`, `package-lock.json`, `.github/workflows/**`). Without it, Dependabot's multi-segment branch names (`dependabot/npm_and_yarn/...`) matched no lane and `khai-branch-scope` rejected every Dependabot PR.

## 0.0.15

### Patch Changes

- dd59607: Blueprint aligns every house to one rule set. Versioning: adding a play takes no changeset; `khai-tests registry build` is the single writer and sets `0.<count>.0` (CLAUDE.md). Gates are khai-named: the `branch-scope` job in `ci.yml` is renamed `khai-branch-scope`. And `ci.yml` grants `packages: read` so `npm ci` can pull `@chbrain/*` from GitHub Packages (the houses install them; the Dependabot-context token needs the scope).

## 0.0.14

### Patch Changes

- 9ad21a8: Stamp houses with security wiring: add `.github/dependabot.yml` (npm + github-actions, weekly) and `.github/workflows/codeql.yml`, and declare least-privilege `permissions: contents: read` in the house `ci.yml`. Every future house inherits these; existing houses are backfilled separately.

## 0.0.13

### Patch Changes

- 76e790a: The generated house derives its version from the play count: the `version`
  script now runs `khai-tests registry build` after `changeset version`, so the
  minor is set to the play count and `package.json` plus `registry.json` are
  reconciled at release. The house CLAUDE.md versioning rule is updated to match,
  a play PR is a patch changeset and the build owns the minor, no hand-bumps.
- 0494215: The generated house test now surfaces advisory validation warnings (e.g. a
  Company element no plot casts) to the CI log instead of dropping them. Warnings
  still never fail the build; they are printed so the drift is visible in CI
  rather than only to a human reading the rendered play.

## 0.0.12

### Patch Changes

- bcc3b98: Complete the management standard in raised houses: add the lifted **Discussion
  Standard** (`management/discussion_instructions.md`, the management-track analog of
  the Prose Standard) and the `management/orders/` home (beside
  `management/discussions/`). A raised house now stamps the full standard — voice
  layer, Discussion Standard, discussions + orders homes, and the company — and all
  instance files conform.
- edc2198: Enshrine the position/persona rules in the house voice layer and Discussion
  Standard: never a position without a name, a position may hold more than one
  Persona, and not every setup carries every position (a needed position with no
  Persona is a failure). Stamped into every house.
- 3b9c7b1: Mirror the Roadie plan model into the house blueprint. The house Roadie now
  carries two standing plans (`plan_keep_clean`, `plan_go_on_tour`); his Orders
  drive them and his Drives carry the green-board principle. He does not hold
  `set up a house`, that is the chain Roadie raising houses, "not all plans in all
  setups". A raised house stamps both plans and conforms.
- cd5a827: Lift the house's dev-steering rules into a single default contract,
  `management/management_instructions.md`: a full HACKS instructions file (Human,
  Agent, Collaboration, Knowledge, System) holding the operating rules every model
  follows in a house. `CLAUDE.md` and `GEMINI.md` are reduced to thin, parallel
  per-tool adaptions that reference it the same way, so the rules live in one place
  and abstract across LLMs. Stamped into every house by the blueprint.
- b8d8b1d: Protect every house's management: the house conformance test now runs the kit
  (`validateProject`) over `management/` too, not just `plays/`. The house cast
  conforms and the orphan-position gate holds in every house's CI - the same call,
  the same wall as the chain. Verified: a raised house validates its management
  clean.
- 737253d: Emit `registry.json` when a house is raised, so the house is green on raise with
  no manual `khai-tests registry build` step. An empty house lists no plays; name
  and version are read from the house package.json (the same source the kit reads),
  so the two never drift. Verified: raising a house validates clean immediately.
- 9d5db23: Add the Roadie to the house blueprint as a management position, symmetric with the
  Theatre Manager and the Playwright. Every stamped house now carries
  `management/position_roadie.md` (the role: wire the stage inbound and the tour
  outbound) and a named `persona_roadie.md` (filled per house). `stageHouse` threads
  a `roadie` slug and `{{ROADIE_*}}` tokens, and the bin takes an optional `[roadie]`
  argument. The named persona is fleshed out in khai-roadie mode, as the Playwright's
  is in khai-playwright mode.

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
