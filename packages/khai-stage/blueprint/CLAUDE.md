# CLAUDE.md, the {{SOURCE_TITLE}} house

This is the {{SOURCE_TITLE}} production house (`khai-plays-{{SOURCE}}`), raised by
khai-stage. The plays are written separately, in khai-playwright mode.

This file is the **coding contract** for the house. Operate also under the
[management instructions](management/management_instructions.md): the khai
**voice and mechanics** (who speaks, the company, management orders). Coding rules
here; voice and mechanics there.

## Branching

Computed, not chosen. Let the guard pick the lane:

```
npx khai-guard branch <topic>
```

- `play/<topic>` owns `plays/**` (the productions).
- `governance/<topic>` owns the gates and config (`.github/**`, `.husky/**`,
  `khai-guard.config.json`, `tests/**`, `CLAUDE.md`, `README.md`, `REFERENCE.md`, `REFERENCES.md`, `management/**`).
- `changeset-release/*` is a bot-controlled general lane for version releases.

A **management order** (`management/orders/**`) is a **rider**: an order directs
work in any lane, so it rides the lane of the change it drives. Write the order
beside that change and the guard folds both onto one branch (an order that
restages a play lands as one `play/` PR); committed alone, an order homes to
`governance/`. So an order and the change it commands are one PR, never two.

Never `--no-verify`. Never merge; open the PR and stop.

## Versioning

We align version numbers using changesets under the following rules:

- **Adding a play** -> `minor` bump (so the minor version indicates the total count of plays).
- **Everything else** (governance, formatting, etc.) -> `patch` bump.

## Protection

Content is CC-BY-NC-SA, code is MIT (see `LICENSE` and `LICENSE-CODE`); the
source is credited where it is in the public domain, never claimed. `main` is
protected: pull requests and the gate checks are required before merge.
