# khai — Copilot instructions

These are imperatives. Follow them literally. The full contract is in
[docs/BRANCHING.md](../docs/BRANCHING.md); [CLAUDE.md](../CLAUDE.md) is the same
contract for every agent. This file exists so you use **khai's own tools**, not
a neighbouring repo's.

## Choosing a branch — do not guess

Make the edits in the working tree first, then let the guard compute the lane:

```
npx khai-guard branch <topic>
```

The guard reads the diff, finds the owning lane, and runs
`git checkout -b <lane>[/<unit>]/<topic>` for you. If the change spans lanes it
**refuses** and prints the split. To check a lane _before_ editing:

```
npx khai-guard advise --files <paths>
```

There is **no** `tests/branch_scope.py` in this repo — that is the Cultures
repo. Do not invent or borrow helpers from other repositories. The only advisor
here is `khai-guard advise`.

## Hard rules — non-negotiable

1. **Never `--no-verify`.** If the pre-push hook fails, the lane is wrong — fix
   it, do not bypass. The required CI checks (`test`, `khai-guard`,
   `branch-scope`) reject a bypassed push regardless, so a push that skipped the
   hook is not "done."
2. **Engine prose stays in its engine lane.** `packages/engines/<name>/**`
   (including `REFERENCES.md`) is owned by `engine/<name>` — never put it on a
   `docs/*` or `chore/*` branch. If `branch-check` rejects it, the rejection is
   **correct**; do not report it as passing.
3. **Source and tests are separate PRs.** `packages/*/index.mjs` and `bin/**`
   land before `packages/*/tests/**`.
4. **Every PR needs a changeset.** Patch is free; minor/major need the
   `bump:minor` / `bump:major` label (the maintainer's call — do not
   self-escalate). A docs/tooling PR needs an empty one:
   `npx changeset add --empty`.
5. **Never merge a PR.** Open it and stop. Merging is the maintainer's.

If the guard's output and your own judgement disagree, the guard wins.

## Security finding workflow

When a security finding (Dependabot, GitHub Advisory, code review, or audit)
arrives:

1. **Use the security-finding issue template** to document: alert source
   (GitHub, advisory link), affected components, severity, and fix plan.

2. **Make the fix, then branch with the guard.** Implement the change, then run
   `npx khai-guard branch security-<issue-id>-<slug>`. The guard places it in
   the lane that owns the files you touched — do not hand-pick the lane.
   - Add explicit `permissions` blocks to workflows.
   - Add one-line comments explaining the security rationale.
   - Test: `npm test`; verify the build if applicable.

3. **Open a PR.** Title `security: [description]`; body `Fixes #<issue-number>`;
   link the GitHub alert. Then **stop** — the maintainer merges. Once it lands,
   GitHub's scanner rescans and the alert auto-closes.

**Governance:** See [.github/SECURITY.md](SECURITY.md) for the complete workflow.

---

_Last updated: June 2026_
