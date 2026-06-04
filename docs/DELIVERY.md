# Delivery Architecture

khai has two architectural concerns. They are peers, not a hierarchy.

**Solution** (`khai-arch`) — the conceptual model: what an engine is, how personas
carry gender, what a skill delivers, how methods structure a retrospective. The
architecture of the thing being built.

**Delivery** (this document) — the engineering system that ships it: how source is
guarded, how packages are versioned and published, how the registry is kept
honest. The architecture of the system doing the building.

This document describes the delivery concern. It does not describe what the
packages contain; `khai-arch` does that.

---

## Components

### khai-guard

The enforcement kernel. A single package (`packages/khai-guard/`) that runs
three gates:

| Gate          | What it enforces                                               |
| ------------- | -------------------------------------------------------------- |
| source/test   | A branch may touch source OR tests, never both in the same PR. |
| branch-scope  | A branch name declares a lane; the diff must stay inside it.   |
| bump-scope    | A changeset declaring minor/major is the maintainer's call.    |
| license-check | Every package and skill must declare the house dual-license.   |

The guard runs locally (pre-push hook) and in CI (required checks). A push that
skips the hook is not done — CI rejects it anyway.

### Lane system

Every branch belongs to a lane. The lane declares what paths the branch may
touch. Ownership is deny-by-default: a path not in the current lane's allow list
is a violation.

| Lane           | Layer        | Owns                                      |
| -------------- | ------------ | ----------------------------------------- |
| `arch/*`       | architecture | `packages/khai-arch/**`                   |
| `governance/*` | governance   | guard, CI, hooks, config                  |
| `engine/*/*`   | solution     | `packages/engines/<name>/**`              |
| `skills/*`     | solution     | `packages/khai-skills/**`                 |
| `methods/*`    | solution     | `packages/khai-methods/**`                |
| `dependabot/*` | deps         | `**/package.json`, `.github/workflows/**` |
| `repo/*`       | infra        | (unowned paths)                           |
| `chore/*`      | general      | (unowned paths)                           |
| `docs/*`       | general      | (unowned paths)                           |
| `fix/*`        | general      | (unowned paths)                           |

Layer order governs merge sequence when a change spans layers:
architecture → governance → solution → infra → general.

The lane topology is computed, not judged. `npx khai-guard branch <topic>` reads
the diff and runs `git checkout -b` for you. A branch name typed by hand is a
guess.

### Publish pipeline

Every package change must be accompanied by a changeset. The pipeline:

```
changeset file (.changeset/*.md)
  └─ Version Packages PR (changesets bot bumps versions + writes CHANGELOGs)
       └─ merge to main → changeset publish (GitHub Packages registry)
```

Patch bumps are free. Minor and major are the maintainer's call — the guard flags
them; the maintainer stamps the label. No self-escalation.

### Registry

All packages publish to GitHub Packages under the `@chbrain` scope. The registry
requires a token with `read:packages` / `write:packages`. The token lives in
GitHub Actions secrets only — never in the session environment.

Consumers install via `.npmrc`:

```
@chbrain:registry=https://npm.pkg.github.com
```

### CI gates

Five required checks on every PR:

| Check          | Tool                    | Blocks merge |
| -------------- | ----------------------- | ------------ |
| `test`         | vitest (all workspaces) | yes          |
| `khai-guard`   | source/test split       | yes          |
| `branch-scope` | lane ownership          | yes          |
| `changeset`    | changeset present       | yes          |
| `bump-scope`   | escalation flag         | advisory     |

CodeQL runs independently (security scanning, not a delivery gate).

### Hook layer

Two hooks enforce the delivery contract locally before a push reaches CI:

| Hook         | Runs      | Does                                                |
| ------------ | --------- | --------------------------------------------------- |
| `pre-commit` | on commit | prettier auto-format staged files; khai conformance |
| `pre-push`   | on push   | source/test split; branch-scope; bump-scope         |

The pre-push hook is the local mirror of CI. If it passes locally, CI passes.

### License enforcement

Every package declares the house dual-license:
`SEE LICENSE IN LICENSE and LICENSE-CODE`

Content (architecture, methods, skills, engine prose) — CC-BY-NC-SA 4.0
(`LICENSE`). Code (`.mjs`, configs, build scripts) — MIT (`LICENSE-CODE`).

`khai-guard license-check` reads `licensePolicy` in `khai-guard.config.json`
and rejects any package or skill that declares a bare permissive license. The
policy is computed, not reviewed.

---

## What this document is not

It is not a branching guide (see `docs/BRANCHING.md`).
It is not agent instructions (see `CLAUDE.md`).
It is not a description of what the packages do (see `khai-arch`).

It is the map of the system that ships khai — a peer concern to the solution
architecture, maintained alongside it.
