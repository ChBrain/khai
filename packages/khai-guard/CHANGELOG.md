# @chbrain/khai-guard

## 0.1.18

### Patch Changes

- 14a9fad: Add `khai-guard member-check`: the member-scope gate. One phenomenon, one engine — fails a PR whose new member stem is already claimed by another engine or restates a whole engine's domain, with `memberPolicy.homonyms` (permanent, same word different science) and `memberPolicy.grandfathered` (standing overlaps awaiting their thinning or cluster review) as the exemption lists.

## 0.1.17

### Patch Changes

- aced93c: changeset-check: scope the releasing-changeset drift check to the changesets the
  PR actually introduces or edits, not every file on disk. `main` legitimately
  accumulates unconsumed releasing changesets between a release-carrying merge and
  the "Version Packages" PR that consumes them; a leftover no longer falsely blocks
  a docs/governance PR that ships no package `files`. The CLI now filters
  `readChangesets()` to the added/modified changeset paths in the diff before the
  check; the genuine "ships nothing but carries a releasing changeset" drift case
  still fails.

## 0.1.16

### Patch Changes

- 0a75c8c: changeset-check: require a `minor` changeset on a content add (was: forbid one).
  A count-driven house now steers every deploy through the "Version Packages" PR,
  so a content add must carry a changeset — and it must be `minor`, because the
  version reconcile clamps the minor to the count and resets the patch. A `patch`
  or empty changeset on a content add survives the reconcile (count === minor
  after the count build) and drifts the version to `0.<count>.1`; the gate now
  rejects it with that explanation. Non-content rules are unchanged (ships `files`
  → patch; ships nothing → empty).

  Note for the maintainer: this tightens the gate's behaviour for every consuming
  house, so it may warrant escalating to a `minor` release via the `bump:minor`
  label rather than shipping as patch.

## 0.1.15

### Patch Changes

- 373e143: Close four holes in the lockfile-scope gate found in review:

  - `lockfile-check` (and `license-check`) now list the tracked tree with
    `git ls-files -z`, so a lockfile under a directory with non-ASCII or
    special characters can no longer evade the gate via core.quotePath
    C-quoting.
  - `lockfile-check` anchors itself at the repo toplevel before loading
    config: run from a package directory it used to silently no-op ("no
    lockfilePolicy configured") and would classify that package's own
    nested lock as the allowed root one.
  - `allowRoot` now exempts only the authoritative root lock (new
    `lockfilePolicy.rootLockfile`, default `package-lock.json`) instead of
    any policed name at root — a committed root `npm-shrinkwrap.json`
    (which npm prefers over package-lock.json) is now an offender.
  - `lockfilePolicy.lockfiles: []` is now a config error instead of an
    always-green gate that still claims the tree was scanned.

## 0.1.14

### Patch Changes

- 60827a4: Add a `lockfile-check` subcommand (and `checkLockfiles` + a `lockfilePolicy`
  config section). In an npm-workspaces monorepo the root `package-lock.json` is
  the only authoritative lock; this gate rejects a lockfile committed inside a
  package — the fossil class that desynced Dependabot and CI (a stale nested lock
  pinned an old dependency, producing a phantom advisory and a downgrade PR). The
  CLI scans the tracked tree and exits non-zero on any nested lockfile.
- e2793d1: Reformat source to prettier 3.9.x output (the dev-tooling group bumps prettier
  to ^3.9.4). Prettier 3.9 changed the formatting of empty `for`-update clauses
  and Markdown list-item continuation indent, so `packages/khai-guard/index.mjs`
  and `packages/khai-rules/CHANGELOG.md` are re-emitted to match. Formatting only;
  no behavior change.

## 0.1.13

### Patch Changes

- 18da675: Treat `copilot/<lane>/...` branch names as aliases of `<lane>/...` in branch classification and branch-scope checks.

## 0.1.12

### Patch Changes

- 44bcafc: changeset-check: flag a releasing changeset that ships nothing. A PR whose
  changed files are all outside the package's published `files` set, yet which
  carries a changeset that declares a bump, would cut a release that republishes
  identical content and drift the version (the spurious `0.<count>.1` patch a
  REFERENCES/docs/tooling PR produces when it uses a `patch` changeset instead of
  `--empty`). The CLI reads the package's `files` (normalized) and passes the
  shipped set in; when `files` is absent the set is unknown and the rule stays off.

## 0.1.11

### Patch Changes

- d5b14ed: changeset-check: exempt the changesets release branch. The bot's "Version
  Packages" PR (`changeset-release/<base>`) exists to consume changesets and bump
  the version, so it carries none by design — the presence gate must not red it.
  `runChangesetCheck` now resolves the branch (`--branch`, else `GITHUB_HEAD_REF`,
  else git) and skips when it is the release branch, so every house is covered by
  the guard itself without wiring a per-repo CI skip.

## 0.1.10

### Patch Changes

- 87ce18d: Add a `changeset-check` gate: a play-count-driven house needs no changeset when a PR adds a new play, but every other shipped change must carry one (real or empty) or it merges and publishes nothing. New `changesetCheck` + `parseChanges` in the library, a `changeset-check` CLI subcommand (hard-fail by default, `--advisory` to soften), and a `changesetPolicy.countDrivenAdd` config section.

## 0.1.9

### Patch Changes

- 5f4b501: branchScope gains a third path class, `riders`. A rider (e.g. a management order
  under `management/orders/**`) rides the lane of the change it accompanies — like
  `shared` it is never an offender on any lane and `advise`/`branch` fold it into
  that lane rather than splitting it off — but, unlike `shared`, it homes to a
  declared `fallback` lane when it rides alone, so it is never stranded. This lets
  an order and the change it drives (e.g. a play) land in one PR while an order
  committed by itself still resolves to a home lane. Configured as
  `{ pattern, fallback }`; `fallback` must name a declared lane. Backward
  compatible: a config without `riders` behaves exactly as before.

## 0.1.8

### Patch Changes

- abbfd25: `khai-guard branch` now validates the full computed branch name before running
  `git checkout -b`. The lane and unit segments are derived from file paths (the
  unit via a path capture), so a path segment like `--orphan` (a legal directory
  name) could reach git as an option rather than a branch name -- argv injection.
  Every segment must now be a plain kebab token, and the checkout is terminated
  with `--`. The topic was already validated; this closes the path-derived gap.
- 43580d1: license-check no longer aborts the whole scan on one unreadable file. A single
  file matched by the policy glob that failed to read or JSON-parse called
  process.exit(2) mid-loop, masking the license verdict on every other package.
  Such a file is now recorded as a violation (its license cannot be confirmed) so
  the scan completes and exits 1 with the offending path named, while a genuine
  environment failure (git ls-files) still exits 2.
- bf263a7: The branch-scope / source-test-mix gate now reads the diff with
  `git diff --name-status -z` (NUL-delimited) instead of the default tab/newline
  format. Git C-quotes and tab-splits paths that contain non-ASCII bytes, quotes,
  or tabs, so such a path matched no lane or bucket and silently passed a gate it
  should have failed. parseNameStatus parses the NUL stream verbatim (and still
  accepts the legacy line form), closing that false-pass.

## 0.1.7

### Patch Changes

- 741d8f5: Integrate automated pre-commit hook verification into the khai-guard CLI.

## 0.1.6

### Patch Changes

- 6d11f95: Add `--staged-only` / `-s` and `--tracked-only` / `-t` options to the `khai-guard branch` CLI command to allow selective change resolution during branch creation when untracked files are present.

## 0.1.5

### Patch Changes

- e310413: `khai-guard branch` now prints a draft reminder after creating the branch: "not
  finished? Open the PR as a draft, and mark it ready only when the change is
  whole." The guard cannot enforce draft state (it lives on GitHub, not in the
  diff), but the branch command is a touchpoint every change passes through, so
  asking for the lane returns the lane and the discipline that goes with opening
  the PR. A reminder, not a gate.

## 0.1.4

### Patch Changes

- 4e617a7: Add dependabot/\* lane with cross-lane allow pass so Dependabot dependency bumps clear branch-scope without renaming.
- c9eff7b: Add the `license-check` subcommand and `licensePolicy` config: every package must declare an allowed (NonCommercial) license and every SKILL.md a NonCommercial CC license, so khai's concepts can't be resold under a bare permissive license. Relicense khai-guard, khai-pack, and khai-rules from plain MIT to the dual-license string (`SEE LICENSE IN LICENSE and LICENSE-CODE`) — content NonCommercial, code MIT — to comply.

## 0.1.3

### Patch Changes

- c222817: feat(cli): `khai-guard branch <topic>` -- deterministic lane selection. Reads the working-tree changes, resolves their lane via `advise`, and creates `<lane>[/<unit>]/<topic>` (or `chore/<topic>` for unowned, or refuses a multi-lane change with the split). The lane is computed from the diff, never chosen by hand -- so a weaker agent cannot land engine content on a docs branch. Pairs with the enforced pre-push/CI branch-check (the wall): the helper gets it right up front; the gate is the backstop.
- 928bc73: fix(branchScope): bind `{name}` by matching the glob, not slicing a literal prefix. `laneForPath` recovered a fan-out lane's `{name}` by slicing the path at the prefix length, landing on the wrong segment whenever a `**` or a group-specific prefix preceded `{name}` -- so those paths came back UNOWNED (a repo with a `**`-prefix surface fan-out never actually owned its pages). `bindName` compiles each `{name}` glob to an anchored regex with `{name}` as a single-segment capture: correct after a literal prefix, a `**`, or across several group globs, which enables true per-unit ownership/isolation. khai engines (literal prefix) unchanged; 63 guard tests pass.

## 0.1.2

### Patch Changes

- 8d48e94: docs(readme): add the unifying idea — the gate is payback, not cost. Frame the four properties that make it more than a written convention (enforced, repo-side, diff-time, self-governing) and that the source/test and branch-scope gates are one principle at two altitudes.

## 0.1.1

### Patch Changes

- 7df156f: Add the bump-scope gate (the third khai-guard rule). A changeset may bump
  `patch` freely, but `minor`/`major` widen the published release and are the
  maintainer's call, not the agent's. The gate cannot HARD-lock that -- the bot
  runs with the maintainer's own credentials, so any in-repo lock it could set, it
  could also unset -- so the teeth are LOUDNESS: every non-patch bump is detected,
  named, and flagged, so an escalation can never ship silently or by accident.

  New pure exports `parseChangeset(text)` and `bumpScope(changesets, config)`, a
  `khai-guard bump-check` CLI subcommand that prints an unmissable banner (plus a
  `::warning::` annotation and a `bump_level`/`bump_label` hand-off on
  `GITHUB_OUTPUT` so CI can stamp the PR), and a `bumpScope` config section
  (`freeLevel`, `labels`). Advisory by default (exit 0); `--enforce` turns it red.
  CI + hook wiring and unit tests land next (kept separate per the source/test
  gate).

## 0.1.0

### Minor Changes

- 25372ae: Add the branch-scope rule: every branch is classified by NAME into a lane, and
  scope is decided by deny-by-default OWNERSHIP. The protected lanes (architecture
  -> governance -> solution) each own their paths, and an owned path may be
  touched only by its owning lane; the general/infra lanes (`repo`, `chore`,
  `fix`, `docs`) own nothing and may touch only unowned + shared paths, so they
  cannot reach a governance-owned file (CI, hooks, the guard config) to weaken the
  gate from outside `governance/`. The solution layer fans out per engine via
  `engine/<name>`, which binds the name to the engine dir. `branchScope.shared`
  (e.g. `.changeset/**`) is unowned metadata any lane may touch. New config section
  `branchScope` in
  khai-guard.config.json; new exports `classifyBranch`, `checkBranchScope`, and
  `advise`; new CLI subcommands `branch-check` and `advise`. Advisory-first:
  `branch-check --warn` (or `KHAI_GUARD_BRANCH_ADVISORY=1`) prints violations but
  exits 0. See docs/BRANCHING.md.

### Patch Changes

- 8066da0: advise: skip shared paths (e.g. `.changeset/**`) instead of listing them as
  unowned. The enforcer (`checkBranchScope`) already waves shared metadata through
  on every lane; `advise` now matches it, so it no longer tells contributors to
  "extend branchScope" for files that are shared by design.

## 0.0.4

### Patch Changes

- cc547d6: Add a `khai-guard doctor` subcommand that diagnoses a repo's adoption instead
  of judging a diff: reports the resolved config and buckets, flags overlapping
  globs on the real tracked tree (exit 2), confirms a CI workflow and
  `.husky/pre-push` reference khai-guard, and reminds the operator to verify the
  branch-protection required check (which it can't read). Exit 0 healthy, 2 on a
  definite misconfiguration; warnings don't fail.

## 0.0.3

### Patch Changes

- 7bfb5e4: CI mode now diffs the three-dot range (`merge-base(base, head)..head`)
  instead of two-dot, so the gate sees only what the branch itself changed.
  Two-dot misfired on any branch that had fallen behind its base: files the
  base advanced past were counted as if this PR touched them. Local
  (pre-push) mode already computed the merge-base, so it is unaffected.

## 0.0.2

### Patch Changes

- 1e4ef27: Harden the guard: validate `khai-guard.config.json` shape (bad buckets
  now fail loud with exit 2 instead of silently matching nothing), detect
  overlapping source/test globs as a config error rather than a phantom
  "mixed" verdict, guard `--base`/`--head` against a missing value, and
  lock deletion/typechange diff parsing under test.

## 0.0.1

### Patch Changes

- dd93a5e: Genesis: KHAI-Guard, the source/test separation gate, published as a
  versioned CLI (`@chbrain/khai-guard`). khai owns the rule; any repo
  adopts it via `npx khai-guard` + an optional `khai-guard.config.json`.
  First release lands at 0.0.1.
