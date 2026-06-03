# @chbrain/khai-guard

**KHAI-Guard** — the source/test separation gate. khai owns the rule; any
repo can adopt it.

> A pull request may change the **product** (`source`) **or** its
> **verifiers** (`test`), never both. Split them — **tests first**.

## Why

Editing code and the test that judges it in the same PR makes it easy to
bend the test to match whatever the code now does, so the test
rubber-stamps the implementation instead of independently specifying
intended behaviour. KHAI-Guard forbids the mix, which keeps the test/CI
layer an honest, leading contract. (CI workflows and git hooks count as
_verifiers_ too — you can't quietly relax a gate alongside the code it
would have caught.)

## Use

```bash
# CI (pass the PR base/head):
npx khai-guard --base "$BASE_SHA" --head "$HEAD_SHA"

# Local (pre-push hook): diffs HEAD against origin/<default>
npx khai-guard
```

Exit `0` = clean, `1` = source/test mixed, `2` = config/usage error.

## Config

Zero-config repos get sensible defaults (`src/**`, `public/**` = source;
`tests/**`, `.github/workflows/**`, `.husky/**` = test). Override per repo
with a root `khai-guard.config.json` (override is per-key):

```json
{
  "source": ["packages/*/architecture/**"],
  "test": ["packages/*/tests/**", ".github/workflows/**", ".husky/**"],
  "exemptRenames": true
}
```

Pure renames/copies (`R100`/`C100`) are exempt by default — moving a file
changes neither product nor contract.

The config is validated on load: a malformed `source`/`test` (not a glob
array), or buckets whose globs **overlap** (a path that matches both),
fail as a config error (exit `2`) rather than silently waving PRs through
or reporting a phantom mix.

## Doctor

```bash
npx khai-guard doctor
```

`doctor` diagnoses a repo's **adoption** instead of judging a diff — for
when the config looks right but the gate isn't actually catching anything.
It reports:

- the **resolved config** (which file, or the package defaults) and the buckets;
- whether the **globs overlap** on the real tracked tree (it classifies
  `git ls-files` and lists any path matching both buckets) — a definite
  misconfiguration, **exit `2`**;
- whether a **CI workflow** references `khai-guard` (and warns about a stale
  inline/`meta-2` gate left behind);
- whether **`.husky/pre-push`** invokes it.

It **cannot** read branch protection, so it prints a reminder to confirm the
_required_ status check is still named `khai-guard` — a renamed-away job stops
gating while every PR keeps showing green. Exit `0` healthy, `2` on a definite
misconfiguration; warnings print but never fail.

## Branch scope

The same "keep the judged separate from the judge" principle, one level up.
Every branch is classified by its **name** into a **lane**, and scope is decided
by deny-by-default **ownership**: the protected lanes
(**architecture -> governance -> solution**, "rules -> the judge -> the
defendant") each own their paths, and an owned path may be touched only by its
owning lane, so the gate is never edited by the branch that needs it to pass.
General/infra lanes (`repo`, `chore`, `fix`, `docs`) own nothing and may touch
only unowned + shared paths, so they cannot reach a governance-owned file to
weaken the gate. The solution layer fans out per engine:
`engine/<name>/<change>` binds `<name>` to the engine directory. See the host
repo's `docs/BRANCHING.md` for the full contract and lane table.

```bash
# what lane(s) do these files belong to?
npx khai-guard advise --files packages/engines/gender/index.mjs

# is the CURRENT branch's diff range inside its lane?
npx khai-guard branch-check          # enforce: exit 1 on a violation
npx khai-guard branch-check --warn   # advisory: print violations, exit 0
```

The lanes are configured under `"branchScope"` in `khai-guard.config.json`: an
optional `shared` glob list (unowned metadata any lane may touch) plus a list of
`{ pattern, layer, allow }` lanes. A protected lane's `allow` is the set of paths
it **owns**; a general/infra lane carries an empty `allow` (it owns nothing). A
fan-out lane adds `unit` (the branch-name segment index that binds `{name}` in
its `allow` globs):

```json
{
  "branchScope": {
    "shared": [".changeset/**"],
    "lanes": [
      { "pattern": "arch/*", "layer": "architecture", "allow": ["packages/khai-arch/**"] },
      {
        "pattern": "engine/*/*",
        "layer": "solution",
        "unit": 1,
        "allow": ["packages/engines/{name}/**"]
      },
      { "pattern": "chore/*", "layer": "general", "allow": [] }
    ]
  }
}
```

Programmatic API: `classifyBranch(name, config)` returns
`{ lane, layer, unit }` (or `null`); `checkBranchScope(name, paths, config)`
returns `{ ok, violations }`; `advise({ files }, config)` returns the lane
grouping and the ordered split. A malformed `branchScope` fails on load as a
config error (exit `2`).

**Advisory-first.** `branch-check --warn` (or `KHAI_GUARD_BRANCH_ADVISORY=1`)
prints violations but exits `0`, so the rule can ride along non-blocking while
existing branches are renamed. Flip to hard-fail by dropping the advisory flag
and making the CI job a required check (no code change needed: enforce is just
"advisory off").
