# @chbrain/khai-guard

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
