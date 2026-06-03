---
"@chbrain/khai-guard": minor
---

Add the branch-scope rule: every branch is classified by NAME into a lane, and
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
