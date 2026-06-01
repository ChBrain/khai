# @chbrain/khai-guard

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
