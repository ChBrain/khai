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

### khai-guard

The enforcement kernel. Runs four gates:

| Gate            | What it enforces                                               | Where         |
| --------------- | -------------------------------------------------------------- | ------------- |
| `source/test`   | A branch may touch source OR tests, never both in the same PR. | hook + CI     |
| `branch-scope`  | A branch name declares a lane; the diff must stay inside it.   | hook + CI     |
| `bump-scope`    | A changeset declaring minor/major is the maintainer's call.    | CI (advisory) |
| `license-check` | Every package and skill must declare the house dual-license.   | hook only     |

`source/test` and `branch-scope` are required CI checks; a push that skips the
hook is not done — CI rejects it anyway. `license-check` runs via the pre-push
hook only and is not yet a CI gate.

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
