# Delivery Architecture

khai has two architectural concerns. They are peers, not a hierarchy.

**Content** (`khai-arch`, `khai-engines`) — the canon and its instances: what an
engine is, what a skill delivers, how methods structure a process. The
architecture of the thing being built.

**Delivery** (this document) — the engineering system that ships it: how content
is registered, validated, packaged, and published. The architecture of the system
doing the building.

This document describes the delivery concern only. It does not describe what the
packages contain; `khai-arch` does that.

---

## Content packages

These are the only purely content-side packages. Everything else is delivery.

| Package        | What it is                                             |
| -------------- | ------------------------------------------------------ |
| `khai-arch`    | The canon — type definitions, chapter rules, mnemonics |
| `khai-engines` | Engine instances derived from the canon                |

---

## Delivery packages

### khai-skills

Skill registry. Self-contained, vendor-neutral agent skills built to the
agentskills.io standard. Content may derive from `khai-arch` or from any other
credible source — the registry does not require khai origin, only structure and
attribution.

### khai-methods

Method registry. Structured process definitions codified from wherever the
practice originated — a book, a team, a tradition. Attribution is recorded via
`invented_by` and `source`; khai packages and credits, never claims.

### khai-plays

Play registry (planned). The index of khai plays: one card per production, each
pointing to where the production lives. khai holds the registry, not the
productions. Plays are authored in khai-playwright mode and live in external
collection repos (`khai-plays-<source>`); this package is the single anchor the
website consumes to render them. Peer to `khai-skills` and `khai-methods`: it
registers, it does not contain.

### khai-guard

The enforcement kernel. Runs four gates:

| Gate            | What it enforces                                               | Where         |
| --------------- | -------------------------------------------------------------- | ------------- |
| `source/test`   | A branch may touch source OR tests, never both in the same PR. | hook + CI     |
| `branch-scope`  | A branch name declares a lane; the diff must stay inside it.   | hook + CI     |
| `bump-scope`    | A changeset declaring minor/major is the maintainer's call.    | CI (advisory) |
| `license-check` | Every package and skill must declare the house dual-license.   | hook + CI     |

All four gates run locally (pre-push hook) and in CI (required checks). A push
that skips the hook is not done — CI rejects it anyway.

### khai-rules

Validation atoms. Pure, canon-agnostic rule infrastructure. Each checker takes
its contract as an argument and knows nothing about which types exist. Used by
`khai-tests` and `khai-guard`.

### khai-tests

Conformance kit. Validates content packages against the architecture canon.
Shared by the workspace and by downstream consumer repos. Runs in CI.

### khai-review

Advisory NLP review lane. Where only meaning can decide — conciseness,
coherence, voice — a pluggable judge reviews and suggests. It never gates; it
informs. No branch lane is assigned; `governance/*` must be extended before
changes to this package can land.

### khai-pack

Packaging. Turns a typed engine bundle into a deterministic, guarded zip in the
khai cultures layout (overhead at root, flat content in a subfolder). The serve
step in the delivery pipeline.

---

## Plays: the registry, not the productions

A play is a production authored in khai-playwright mode: a play file, the plots
it chains, and the elements those plots cast. A play is not an engine and not
canon. It is an instance built with khai, so khai's job is to register it, never
to hold it. This is the split that keeps Cultures out of the monorepo, applied
one layer up:

- **khai owns** the `play` type (`khai-arch`), the conformance kit that validates
  a play (`khai-tests`), the seal that packages it (`khai-pack`), and the
  registry that indexes every play as a card (`khai-plays`).
- **khai does not own** the productions. Each collection is its own external repo
  keyed by source (`khai-plays-buechner`, `khai-plays-<author>`), consuming khai
  as Cultures does (canon, kit, guard) and publishing its productions as
  `khai-play-<production>` packages.

The pipeline, end to end:

| Stage    | Who                                | What                                                                                |
| -------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| author   | `khai-playwright` (mode)           | authors a production, sealed as a zip by `khai-pack`                                |
| collect  | `khai-plays-<source>` (external)   | validates (`khai-tests`), guards (`khai-guard`), publishes `khai-play-<production>` |
| register | `khai-plays` (registry, khai owns) | one card per production: title, source, where it lives. The index, not the content  |
| render   | website                            | reads the registry, renders "khai plays" with a card per production                 |

Website discovery differs from engines on purpose. Engines are installed packages
the site finds in `node_modules` (`loadEngines`). Plays are external productions
the site does not install: it reads khai's registry and renders a card per entry,
each linking out to its production. khai is the source of truth for which plays
exist; the productions stay where they are made.

Status: the design, not the build. The `khai-plays` registry package and the
first collection (`khai-plays-buechner`) are forthcoming; this records the
contract they instantiate. When `khai-plays` lands it takes a `plays/*` lane,
peer to `skills/*` and `methods/*`.

---

## Lane system

Every branch belongs to a lane. The lane declares what paths the branch may
touch. Ownership is deny-by-default.

| Lane           | Layer        | Owns                                         |
| -------------- | ------------ | -------------------------------------------- |
| `arch/*`       | architecture | `packages/khai-arch/**`                      |
| `governance/*` | governance   | guard, tests, rules, pack, CI, hooks, config |
| `engine/*/*`   | solution     | `packages/engines/<name>/**`                 |
| `skills/*`     | solution     | `packages/khai-skills/**`                    |
| `methods/*`    | solution     | `packages/khai-methods/**`                   |
| `dependabot/*` | deps         | `**/package.json`, `.github/workflows/**`    |
| `repo/*`       | infra        | (unowned paths)                              |
| `chore/*`      | general      | (unowned paths)                              |
| `docs/*`       | general      | (unowned paths)                              |
| `fix/*`        | general      | (unowned paths)                              |

Layer order governs merge sequence when a change spans layers:
architecture → governance → solution → infra → general.

The lane topology is computed, not judged. `npx khai-guard branch <topic>` reads
the diff and runs `git checkout -b` for you.

---

## External dependencies

khai-native components only. Everything else is a dependency.

| Dependency      | Role                                  |
| --------------- | ------------------------------------- |
| changesets      | version management + publish pipeline |
| GitHub Actions  | CI platform                           |
| GitHub Packages | `@chbrain` npm registry               |
| husky           | git hook runner                       |
| vitest          | test runner                           |
| prettier        | formatter                             |

---

## What this document is not

It is not a branching guide (see `docs/BRANCHING.md`).
It is not agent instructions (see `CLAUDE.md`).
It is not a description of what the packages contain (see `khai-arch`).

It is the map of the system that ships khai — a peer concern to the content
architecture, maintained alongside it.
