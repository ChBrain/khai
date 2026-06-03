# Branch naming and scope (khai)

The single source of truth for which branch may touch what. The rule is
enforced by `@chbrain/khai-guard` (`khai-guard branch-check`) and described
here for humans and agents. If this document and the guard disagree, the guard
wins; fix the document.

## Why

khai already separates the **judged** from the **judge** at the diff level:
a pull request may change the product or its verifiers, never both
(`khai-guard`, the source/test gate). Branch scope extends the same honesty to
the branch level.

Every branch is classified by its **name** into a **lane**. Scope is decided by
**ownership**, deny-by-default: each path is locked to the one lane that owns it,
and a branch may touch a path only if it is that path's owner (plus shared
metadata, below). The lanes encode a layered order:

```
architecture  ->  governance  ->  solution
   (rules)         (the judge)    (the defendant)
```

You cannot weaken the gate inside the same branch that needs it to pass: the
governance layer (the guard, its tests, CI, hooks) sits above the solution
layer (the engines) it judges, and architecture sits above governance. A branch
named for the solution cannot edit the judge; a branch named for the judge
cannot rewrite the rules. A wrong name fails fast, before any path is examined.

## Lanes

| Branch pattern                                  | Layer        | May touch                                                                                                                                              |
| ----------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `arch/<change>`                                 | architecture | `packages/khai-arch/**`                                                                                                                                |
| `governance/<change>`                           | governance   | `packages/khai-guard/**`, `packages/khai-tests/**`, `packages/khai-rules/**`, `.github/**`, `.husky/**`, `khai-guard.config.json`, `docs/BRANCHING.md` |
| `engine/<name>/<change>`                        | solution     | `packages/engines/<name>/**` (the `<name>` segment must equal the engine dir)                                                                          |
| `repo/<change>`                                 | infra        | only **unowned** + **shared** paths (root configs, `README.md`, ...); owns nothing                                                                     |
| `chore/<change>` `fix/<change>` `docs/<change>` | general      | only **unowned** + **shared** paths; owns nothing                                                                                                      |

`<change>` is a free kebab-case topic. The layer is derived from the prefix.

### Ownership is deny-by-default

The `arch`, `governance`, and `engine` lanes are **protected**: the paths in
their `allow` are **owned**, and an owned path may be touched only by its owning
lane. A general or infra lane (`repo`, `chore`, `fix`, `docs`) owns **nothing**;
it may touch only paths that no protected lane claims (**unowned**) plus shared
metadata. This is the load-bearing half of the rule: a `chore/` or `repo/`
branch can no longer reach a governance-owned path (for example
`.github/workflows/ci.yml` or `khai-guard.config.json`) and weaken the gate from
outside `governance/`. Conversely, a protected lane may **not** stray onto an
unowned path: an `arch/` branch that edits `README.md` is rejected and told to
use a `repo/` or `chore/` branch.

### Shared metadata

`branchScope.shared` (today `.changeset/**`) is unowned safe metadata that
**any** lane may touch, since every change ships a changeset that travels with
it. Shared paths are never offenders and are never attributed to an owner.

### The solution layer fans out per engine

There is no single "solution" lane. The solution layer is the set of engines
under `packages/engines/`, and each engine is its own lane:
`engine/<name>/<change>`. The `<name>` branch segment **binds** to the engine
directory: an `engine/gender/...` branch may touch `packages/engines/gender/**`
and nothing else. A mismatch (an `engine/gender/...` branch editing
`packages/engines/orientation/**`) is rejected. This keeps engines independent
and lets them land in parallel without one engine's branch silently reaching
into another.

### Multi-lane work is illegal

A single change set that spans more than one lane cannot live on one branch.
Split it into per-lane branches and merge them in layer order:
architecture, then governance, then solution. Ask the advisor (below) and it
prints the exact branches and the order.

## Pre-flight: ask the advisor

Before you `git checkout -b`, let the guard tell you the lane(s) for the files
you expect to change:

```bash
npx khai-guard advise --files packages/engines/gender/position_male.md
# -> one lane (solution): git checkout -b engine/gender/<change> origin/main

npx khai-guard advise --files packages/khai-guard/index.mjs packages/khai-arch/architecture/x.md
# -> SPLIT REQUIRED: a governance branch and an arch branch, in order
```

## The check

`khai-guard branch-check` classifies the **current** branch by name, diffs its
range against `origin/main` (the same three-dot merge-base range the source/test
gate uses), and requires every changed path to be in the branch's lane. It runs
in the pre-push hook and in CI.

```bash
npx khai-guard branch-check          # enforce: exit 1 on a violation
npx khai-guard branch-check --warn   # advisory: print violations, exit 0
```

### Advisory-first

While the live `claude/*` branches are still being renamed to the lane scheme,
`branch-check` runs in **advisory** mode: it prints violations but exits 0, so
it never blocks a push or a build. Advisory mode is on when `--warn` is passed
or `KHAI_GUARD_BRANCH_ADVISORY=1` is set; both the pre-push hook and the CI step
ship with it on today.

To **flip to hard-fail** once the branches are renamed:

1. Drop `--warn` from `.husky/pre-push` (the `branch-check` line).
2. Drop `--warn` (and the `KHAI_GUARD_BRANCH_ADVISORY` env) from the
   `branch-scope` step in `.github/workflows/ci.yml`.
3. Make the `branch-scope` CI job a **required** status check in branch
   protection.

Nothing in `@chbrain/khai-guard` changes to enforce: enforce is simply
"advisory off". The exit-1 path is already wired.

## Config

The lanes live in `khai-guard.config.json` under `"branchScope"`. Each lane is
a branch-name `pattern` bound to a list of **owned** path globs (`allow`). For a
protected lane those globs are what it owns; a general/infra lane carries an
empty `allow` (`[]`) because it owns nothing and is permitted only unowned +
shared paths. A fan-out lane sets `unit` (the segment index of the bound name)
and uses the `{name}` placeholder in its globs, which the classifier substitutes
from the matched branch segment. `branchScope.shared` is a separate glob list of
unowned metadata any lane may touch. See that file for the live values.
