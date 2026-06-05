# CLAUDE.md, the {{SOURCE_TITLE}} house

This repository is a **khai plays house**: a production house dedicated to one
source, {{SOURCE_TITLE}}. It was raised by khai-stage (the impresario's
generator); the plays are written separately, in khai-playwright mode.

## What lives here

- `plays/` holds the productions: each play file plus the plots it chains and the
  elements those plots cast. This is the only content.
- The rest is the wiring and the gates, raised once and not improvised.

## The house is the Estate

`README.md` is this house's **Estate identity**: the production that answers for
the run. Every play logs the house in its `Estate` (E), and the conformance test
checks the link resolves. A play with no Estate is not yet a production.

## Branching

Computed, not chosen. Let the guard pick the lane:

```
npx khai-guard branch <topic>
```

- `play/<topic>` owns `plays/**` (the productions).
- `governance/<topic>` owns the gates and config (`.github/**`, `.husky/**`,
  `khai-guard.config.json`, `tests/**`).

Never `--no-verify`. Never merge; open the PR and stop.

## Protection

Content is CC-BY-NC-SA, code is MIT (see `LICENSE` and `LICENSE-CODE`); the
source is credited where it is in the public domain, never claimed. `main` is
protected: pull requests and the gate checks are required before merge.
