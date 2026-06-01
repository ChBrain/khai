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
