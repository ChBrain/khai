# AGENTS.md, the {{SOURCE_TITLE}} house

This is the {{SOURCE_TITLE}} production house (`khai-plays-{{SOURCE}}`), raised by
khai-stage. The plays are written separately, in khai-playwright mode.

**This is the coding contract, and it is vendor agnostic.** It applies in full to
every model that works here. The vendor files (`CLAUDE.md`, `GEMINI.md`,
`.github/copilot-instructions.md`) point at this one and carry nothing but their
own tool's quirks. None of them points at another: a contract that lives in one
vendor's file makes that vendor its owner, and the rules here belong to the
house.

**Voice first.** Operate under the
[management instructions](management/management_instructions.md): the khai
**voice and mechanics** (who speaks, the company, management orders). _Then_ this
file is the **coding contract** for the house. Voice and mechanics there; coding
rules here. The order matters: management voice first, coding second.

> **Case law next.** [conduct.md](node_modules/@chbrain/khai-stage/conduct.md)
> ships with `@chbrain/khai-stage`, the package that raised this house, and is
> the shared case law for working in any khai house: how a model reads a rule,
> measures a claim, trusts a check. This file stays the short, executable
> contract; it does not restate that reasoning.

## Starting a file

Do not hand-write a khai file from memory of its chapters. Every type ships a
complete, valid skeleton in the canon, and `@chbrain/khai-arch` is already a
dependency of this house, so all nine are installed here:

```
ls node_modules/@chbrain/khai-arch/templates/
cp node_modules/@chbrain/khai-arch/templates/template_process.md plays/<play>/process_<name>.md
```

One per type (persona, piece, pitch, place, plan, play, plot, position,
process): right chapters, in the right order, with the right frontmatter. The
kit proves each one valid against its own type contract, so the whole class of
defect where a file invents a chapter name or drops a required one cannot
survive the first step.

This is not a style preference. A house once took in ten productions that
arrived with the same wrong chapter names, from a base whose own rules already
tabled the correct ones: a list you read is not a file you were handed.

**Then write it.** A stamped template validates, which is what makes it a safe
starting point and also what makes an unedited one shippable. The prose under
each heading is the canon's account of what that chapter is for; it is
instruction to you, never content to leave behind.

`templates` starts a file, `types` checks one. Both are exports of
`@chbrain/khai-arch`.

## Branching

Computed, not chosen. Let the guard pick the lane:

```
npx khai-guard branch <topic>
```

- `play/<topic>` owns `plays/**` (the productions).
- `governance/<topic>` owns the gates and config (`.github/**`, `.husky/**`,
  `khai-guard.config.json`, `tests/**`, `AGENTS.md` and the vendor files that
  point at it, `README.md`, `REFERENCE.md`, `REFERENCES.md`, `management/**`).
- `changeset-release/*` is a bot-controlled general lane for version releases.

A **management order** (`management/orders/**`) is a **rider**: an order directs
work in any lane, so it rides the lane of the change it drives. Write the order
beside that change and the guard folds both onto one branch (an order that
restages a play lands as one `play/` PR); committed alone, an order homes to
`governance/`. So an order and the change it commands are one PR, never two.

Never `--no-verify`. Never merge; open the PR and stop.

## Versioning

The minor version IS the play count, computed not chosen. The `version` script
runs `khai-tests registry build`, which sets the version from the play count:
`0.<count>.0` (the minor is the count, the patch resets to 0), reconciling both
`package.json` and `registry.json`. The build is the single writer of the
version; never hand-edit it.

- **Adding a play** -> no changeset. The play PR runs `khai-tests registry build`,
  which moves the minor to the new play count and resets the patch to 0
  (`0.<count>.0`); `changeset publish` ships it. A per-play changeset would
  re-bump the patch on top of the minor the build already moved, the
  `0.<count>.1` drift to avoid.
- **A non-play change** (governance, formatting, a fix to existing content) ->
  a `patch` changeset; it ships at the same play count.

A non-zero major resets the minor while the count keeps climbing, so a house
stays `0.x`; the numbering guard rejects a major bump.

## Protection

Content is CC-BY-NC-SA, code is MIT (see `LICENSE` and `LICENSE-CODE`); the
source is credited where it is in the public domain, never claimed. `main` is
protected: pull requests and the gate checks are required before merge.
