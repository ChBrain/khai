# CLAUDE.md — khai monorepo

_Read this before you touch anything. These are imperatives, not background.
The depth lives in [docs/BRANCHING.md](docs/BRANCHING.md); this file is the
short, executable contract every agent (Claude, Copilot, any model) follows._

> **Voice first.** Operate under the khai **voice layer**,
> [management_instructions.md](packages/khai-plays/management/management_instructions.md):
> who speaks, through
> which Persona, and how the company collaborates. _Then_ this file is the
> **coding contract** (branching, lanes, changesets, the gates). Voice and
> mechanics live there; coding rules live here. The two are separate layers,
> and the order matters: management voice first, coding second.

## The one rule that removes the guesswork

**Do not choose a branch by hand.** Make your edits in the working tree first,
then let the guard compute the lane from the diff:

```
npx khai-guard branch <topic>
```

`<topic>` is a kebab-case change name (`add-axis`, `fix-colons`). The guard
reads `git diff` + untracked files, finds the lane that owns those paths, and
runs `git checkout -b <lane>[/<unit>]/<topic>` for you. If the change spans two
lanes it **refuses** and tells you how to split. A branch name you typed
yourself is a guess; this is not.

If you want to know the lane _before_ editing (or to plan a split), ask the
advisor — **this repo's own advisor**, not a neighbouring repo's:

```
npx khai-guard advise --files <paths>
```

> Do **not** reach for `tests/branch_scope.py` or any helper from the Cultures
> repo. It does not exist here. khai's advisor is `khai-guard advise`.

## Hard rules — non-negotiable

1. **Never `--no-verify`.** The pre-push hook runs the guard. If it fails, the
   change is in the wrong lane — fix the lane, never bypass the gate. A push
   that skipped the hook is not "done"; the required CI checks (`test`,
   `khai-guard`, `branch-scope`) will reject it anyway.
2. **Engine content stays in its engine lane.** Anything under
   `packages/engines/<name>/**` — including `REFERENCES.md` and other prose —
   is owned by `engine/<name>`. It never rides a `docs/*` or `chore/*` branch.
   `branch-check` will reject it; that rejection is correct.
3. **Source and tests are separate PRs.** A change to `packages/*/index.mjs`
   (or `bin/**`) and a change to `packages/*/tests/**` cannot share a branch.
   Land source first; tests are dormant (`describe.skipIf(DORMANT)`) until it does.
4. **Every PR needs a changeset.** A package change needs a real changeset;
   patch is free, but **minor/major** require the `bump:minor` / `bump:major`
   label (the maintainer's call — do not self-escalate). A tooling/docs PR that
   ships no package change still needs an **empty** changeset:
   `npx changeset add --empty`.
5. **Never merge.** Open the PR and stop. Merging is the maintainer's.
6. **A PR with more coming is a draft.** If the change is not whole, open the PR
   as a **draft** (or label it do-not-merge) and say what is still to land.
   Never stack a follow-up commit on a PR that is already _ready_: the maintainer
   may squash-merge it before your commit arrives, and the rest is stranded in
   the branch. Mark it ready only when the change is complete. The guard cannot
   see this — draft state lives on GitHub, not in the diff — so it is on you.
7. **One phenomenon, one engine — and member files are API.** A new member
   whose stem another engine already claims (or that restates a whole engine's
   domain) fails `khai-guard member-check`; that rejection is correct — thin it
   to a pointer at the owning engine, or (same word, different science) ask the
   maintainer to whitelist it under `memberPolicy.homonyms`. And because
   composites hard-link member files by name, **renaming or removing a member
   is a breaking change**: at least `bump:minor` (the maintainer's label),
   never a silent patch. Adding members stays patch-free.

## Lanes at a glance (the full table is in docs/BRANCHING.md)

| You changed…                                                                             | Lane                       |
| ---------------------------------------------------------------------------------------- | -------------------------- |
| `packages/khai-arch/**`                                                                  | `arch/<topic>`             |
| `packages/khai-guard/**`, `.github/**`, `.husky/**`, `khai-guard.config.json`, this file | `governance/<topic>`       |
| `packages/engines/<name>/**`                                                             | `engine/<name>/<topic>`    |
| `packages/composites/<name>/**`                                                          | `composite/<name>/<topic>` |
| `packages/khai-skills/**`, `docs/SKILLS.md`                                              | `skills/<topic>`           |
| `packages/khai-methods/**`, `docs/METHODS.md`                                            | `methods/<topic>`          |
| an unowned top-level file only                                                           | `chore/<topic>`            |

Lane identity is the first segment of the pattern, so two surfaces sharing a
prefix are **not** mutually isolated unless the lane fans out per unit. What the
guard guarantees and what it does not is spelled out in
[docs/BRANCHING.md](docs/BRANCHING.md) — read it before assuming isolation you
don't have.

## Lanes of protection (what licence covers what)

Branch lanes decide _where code lands_; protection lanes decide _how it is
licensed_. The principle: **khai's concepts are NonCommercial — nobody takes the
architecture and resells it — while the code stays open.** Every package is
backed by khai content, so every package declares the same dual licence.

| The work…                                                       | Licence                             | Why                                                             |
| --------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------- |
| khai **content** — canon, engine content, methods, skill guides | **CC-BY-NC-SA 4.0** (`LICENSE`)     | the concepts are not free: no commercial resale                 |
| khai **code** — every package's `.mjs`, configs, build scripts  | **MIT** (`LICENSE-CODE`)            | the mechanism is open                                           |
| **others' work** khai incorporates (e.g. the 4 L's, Starfish)   | not ours to licence — **credit** it | `invented_by` + `source`: we package and attribute, never claim |

So **every `package.json` declares `SEE LICENSE IN LICENSE and LICENSE-CODE`**
(content NC + code MIT in one), and **every `SKILL.md` declares a NonCommercial
CC licence** (`CC-BY-NC-4.0` / `CC-BY-NC-SA-4.0`). This is computed, not judged:
`khai-guard license-check` reads the `licensePolicy` in `khai-guard.config.json`
and rejects a bare permissive licence that would let the concepts walk free. A
plain-MIT package declaration is a finding, not a style choice.

## Why this file is imperative

Different models have different judgement. A generic "consider the branch
scope" prose note is read differently by a strong and a weak model — the weak
one improvises (e.g. picks `docs/` for an engine file and claims the gate
passed). So the lane is **computed, not judged**: run `khai-guard branch`, obey
the hook, let the required CI check be the wall. Follow the commands above
literally and the scope takes care of itself.
