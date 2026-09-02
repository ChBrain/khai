# @chbrain/khai-stage

## 0.0.27

### Patch Changes

- 3f6d2ca: The stamped pre-push hook runs the suite, and git exports GIT_DIR into every
  hook it runs. A house whose suite builds scratch repositories in a temp
  directory found its scratch `init` and `commit` acting on the real repository
  under that hook: two scratch commits on the branch being pushed and a checkout
  flipped to bare. The hook now drops GIT_DIR, GIT_WORK_TREE and GIT_INDEX_FILE
  before the gates, so a suite run from the hook sees the same environment as
  one run from a shell.

## 0.0.26

### Patch Changes

- 673b628: The blueprint disagreed with the guard it ships. Its contract said a play add
  takes no changeset while `khai-guard changeset-check` requires a `minor` on any
  count-driven add, and both content houses had converged on `minor` independently,
  each documenting the `0.<count>.1` drift. Its manifest template had no `prepare`
  script, so the pre-push hook it stamps was never installed by `npm ci`. Its
  release workflow was still on changesets/action v1 with the old input names, the
  failure two houses had already repaired with the same test. And every house it
  raised points at `node_modules/@chbrain/khai-stage/conduct.md` without depending
  on khai-stage, so the case law was unreachable from every house.
  
  All four are repaired in the stamp, and the stamp now carries what the houses
  built beside them: a declared `gates` list run by one script and by the pre-push
  hook after a lockfile check, a `countDrivenAdd` policy with the CI job that reads
  it, `.changeset/**` as a rider, `.gitattributes` forcing LF, `.claude/` ignored,
  current pins, and a stamped test that holds `registry.json` to a fresh build and
  the management core to the installed blueprint. Two kit house checks are wired
  dormant and wake on the kit bump that exports them.
- 78e05f0: The blueprint gains a vendor-agnostic contract, and tells a house where a file
  starts.
  
  `AGENTS.md` is now the coding contract. `CLAUDE.md`, `GEMINI.md` and
  `.github/copilot-instructions.md` point at it and carry only their own tool's
  quirks; none points at another. Previously the contract lived in `CLAUDE.md` and
  the other two pointed there, which made one vendor the owner of rules that
  belong to the house -- and it showed: the Copilot file carried a rule about
  `claude/*` branch names, a quirk of a different tool entirely. That rule now
  lives in `CLAUDE.md`, and the Copilot file drops from 50 lines of duplicated
  contract to 11 lines of pointer.
  
  `AGENTS.md` also gains "Starting a file". Every house khai-stage raises already
  devDepends on `@chbrain/khai-arch`, so the nine authoring templates are installed
  on day one, complete and valid -- and nothing in the blueprint named them. It
  states the trap too: a stamped template validates, which is what makes it a safe
  start and what makes an unedited one shippable.
  
  The governance lane allows `AGENTS.md`.
- 0212931: The blueprint's voice layer said the coding rules live in the tool files. #1463
  fixed exactly this in khai's own voice layer and missed the blueprint's, so every
  house stamped since would have inherited the defect the parent had already
  repaired.
  
  Reworded rather than renamed, matching #1463: the per-tool files carry only that
  tool's own quirks and point back at the contract, so none of them is where a
  coding rule lives.
- 63df3e2: conduct.md gains law 11: a kit wall is measured against every house it will
  judge, before it ships.
  
  The lesson lived only in pull request bodies, which law 6 already forbids. Two
  cases from the khai-tests 0.4.x cycle carry it. `originRowErrors` shipped in
  0.4.0 measured against khai alone, where six non-author Origin rows are declared
  as strings; measured against khai-misfits after release it raised 499 errors over
  352 distinct Source values in 268 misfits, all of them that house's standing
  idiom rather than defects, and declaring 352 strings is what that house's own
  ruling forbids. Adoption stalled until 0.4.1 made an entry declarable as a
  pattern. The near miss runs the other way: the gates runner defaults its content
  root to `packages/` and khai-misfits keeps its content in `misfits/`, so a
  packages-only visibility check would report clean on a tree it cannot see, which
  was answered at design time with `--content-root`.
  
  Numbering is stable: the new law is appended as 11 rather than placed
  thematically, because other houses cite these laws by number. Law 3 gains a
  one-sentence forward pointer, and Credits attributes section 11.
- a80948f: Three lessons lifted into shared case law from houses that had already learned
  them on their own. Law 2 gains the cultures house's rule that a count or a
  verdict is reported only from a run just made, lifted out of one vendor file so
  every agent carries it. Law 4 gains the misfits house's case for why one built
  file comes back unformatted after every rebuild, and what that says about
  reading the step that failed rather than the job name. A new law 12 records
  adopting a kit wall dormant, behind a probe for the export it needs, and
  retiring a house's local workaround the moment the kit takes the check over.
- e774ef2: Three argument-parsing bugs in `khai-stage`, all of which reported success.
  
  `--help` was unhandled, so it became the source name and raised a 54-file house
  called `khai-plays---help` in the working directory. A generator whose help flag
  generates is the one flag a stranger tries first.
  
  `--anchor` was in the usage line and the file's own header and was never in the
  flag map, so `khai-stage buechner --anchor process_` stamped the house into a
  directory literally named `--anchor` and called the Theatre Manager `process_`.
  It now reaches the manifest: a canon house stamped with `--anchor culture_`
  declares `anchor: "culture_"` instead of the `play_` default.
  
  An unknown flag fell through to the positional list and became the target
  directory, so a typo stamped a house into a folder named after the typo. It is
  now an error naming the option.
  
  Every error path writes nothing.
- 5a1b033: conduct.md's prescriptive references to `CLAUDE.md` name `AGENTS.md`, and say
  where quirks live rather than folding them into the contract. The one historical
  reference (`GEMINI.md` was 31 lines against `CLAUDE.md`'s 308) is untouched:
  repointing it would falsify a measurement.
  
  The README names what the stamper actually lays now, and `stage.test.mjs` gains a
  wall for the shape rather than the file names: every vendor file must point at
  `AGENTS.md` and at no other vendor, and `README.md` must carry the pointer too.
  Presence was already asserted; the direction of the pointers was not, and the
  direction is the property that keeps one tool from owning the house's contract.

## 0.0.25

### Patch Changes

- 2300bef: stage: ship the Dependabot wiring whole. A house now stamps with a `dependabot/*`
  lane in `khai-guard.config.json` (so bot bump PRs have a home and pass
  branch-scope) and `packages: read` in `ci.yml` (so the Dependabot-context token
  can `npm ci` the public `@chbrain/*` packages from GitHub Packages — without it
  only the bot PRs 403). The blueprint already shipped `dependabot.yml`; the lane
  and the token scope were the missing halves, so every dependency PR raised against
  a fresh house was red. The stage test now asserts all three travel together.
- 38e97ee: Ship `conduct.md`, the shared case law for working in a khai house (moved from
  `@chbrain/khai-arch`, which never released it), so a house is born pointing at
  it.
  
  khai-stage's `blueprint/` stamps every new house's CLAUDE.md, GEMINI.md and
  `management/`, so a house's contract files are computed here, not in khai-arch.
  The blueprint is the natural home for the case law those files point at: a
  house that reads its own CLAUDE.md already reads a pointer to conduct.md, and
  that pointer only stays correct if the doctrine ships beside the thing that
  stamps it.
  
  It sits at the package root, deliberately outside `blueprint/`: `stageHouse`
  only walks `blueprint/`, so a root-level file is never copied into a raised
  house as a second, divergent file. One copy per world, read from the installed
  package at `node_modules/@chbrain/khai-stage/conduct.md`, the same shape law 6
  inside the document itself argues for.
  
  `blueprint/CLAUDE.md` and `blueprint/GEMINI.md` each gain a short pointer
  blockquote at that path, so every house khai-stage raises from here on is born
  pointing at the case law.

## 0.0.24

### Patch Changes

- 93aa178: Stamp the khai-drift alarm into every house. A house had no way to tell it was
  behind the kit unless somebody wrote the workflow there by hand, so a stamped
  house could sit many minor versions back in silence. The blueprint now carries
  all three parts the alarm needs: dependabot ignores `@chbrain/*` (it has no
  GitHub Packages credential and only produces broken pull requests),
  `.github/workflows/khai-drift.yml` asks `khai-guard drift` weekly and reports
  into one issue, and `khai-guard.config.json` declares the `driftPolicy` scopes
  without which drift passes silently.
- c6d9ab9: Stamp the lockfile sync into a house's version run, last in the chain. A house
  released with its lockfile a version behind, because nothing rewrites it after
  the version moves -- and in a house the version moves twice, since
  `khai-tests registry build` sets it from the play count after `changeset version`
  has already bumped it. The sync therefore runs after both, and a test pins that
  order: placed between them it would record a number `registry build` replaces,
  leaving the drift while looking fixed.

## 0.0.23

### Patch Changes

- c6633b8: Stamp a README into every house's management directory, saying what the layer is and where its boundary runs: the house's own company, extra by design, and never part of the collection.
- 5749ffd: Stamp any of the three house kinds. `--kind <stage|work|canon>` sets the house's identity and structure: a `work` or `canon` house is named `khai-<source>`, indexes a collection named for itself (or `--collection <name>`), declares it in `khai.collection`, and gets that directory and registry key instead of `plays`. `stage` is the default and is unchanged.

## 0.0.22

### Patch Changes

- 948125f: Stamp scenarios/ into the house gitignore; accept --repertoire to seed house dependencies.

## 0.0.21

### Patch Changes

- f83a54c: Order 5 (blueprint seed, step 2): reconcile the blueprint's audit set to the position-derived harness. The three fixed-rubric audits (`conciseness`, `khai-type`, `voice-conformance`) are replaced by two: a `team` audit that resolves the house's rubrics from its own management positions (`fromPositions`) and runs them robustly (consensus, skeptic), and a `voice-conformance` audit kept as the retained voice lens (global mechanism, local words), now also robust. `conciseness` and `khai-type` drop to opt-in: a house adds them if it wants, they are no longer imposed. This carries order 4's ruling into what every house is raised from: no universal rubric set, the count is the house's, and the review does not ride on one sample of one model. The audit workflow is generic over `audit/*/audit.json`, so no workflow change is needed; a house gains the position-driven audit once it bumps `khai-review` to the version that resolves it.
- 3326114: Stamp a `format:check`-green house by construction: format the generated markdown. `khai-stage` fills the source name into aligned markdown tables in `REFERENCES.md`, so substitution changes the cell widths (a short source like `L2` narrows a column padded for the `{{SOURCE_TITLE}}` token) and prettier reflows the stamped baseline, turning the house's very first `format:check` red before a play is written. The generator now runs its stamped markdown through prettier using the house's own `.prettierrc`, so the output is clean for any source and nothing is exempted from the gate: the reference warrant stays under `format:check` for the operator's later edits. Scoped to markdown, the only surface substitution can dirty. `stageHouse` is now async (prettier's format is async); its two callers await it.

## 0.0.20

### Patch Changes

- 8fb2701: Name the cast in the Director position (blueprint copy that houses are stamped
  from and converge to). Identical to the khai-plays doctrine change: the position
  encodes the separation of two stances (the immersed cast as producer, the
  Director outside it reading and redirecting), the channel discipline, and that a
  captured or handed-over run is the cast's work, selected and never authored by the
  Director. Also adds "tune the pitch" to the redirect idioms (pairs with the pitch
  element type in khai-arch). Houses pick this up on their normal khai-stage
  dependency rollout.

## 0.0.19

### Patch Changes

- 906c053: Rewrite position_director and plan_stage_the_score to the control-loop seat. The
  Director is no longer a teller that renders one frozen telling from a score; it
  runs the play as a living production (a control loop over the board it casts),
  reads the behaviour, redirects each element in its idiom, may request the cast be
  adapted, and captures a chosen run to the archive. Aligns the blueprint doctrine
  with the rebuilt Director skill.

## 0.0.18

### Patch Changes

- 6ffe2f0: Add `language: english` to the blueprint management core files. A non-English
  house's language gate requires every management file to declare its language;
  the houses already carried `language: english`, but the chain-owned blueprint
  core omitted it, so converging a non-English house (e.g. Grimm `de`) to the
  blueprint stripped the field and broke the house gate. Surfaced by the management
  convergence gate (Order 0b).

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
