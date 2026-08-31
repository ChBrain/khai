# AGENTS.md — khai monorepo

_Read this before you touch anything. These are imperatives, not background.
The depth lives in [docs/BRANCHING.md](docs/BRANCHING.md); this file is the
short, executable contract, and it is vendor agnostic: it applies in full to
every agent that works on this repository, named below or not. If you were given
no other file, this is your file._

> **The vendor files carry quirks, never contract.** `CLAUDE.md`, `GEMINI.md`,
> `PERPLEXITY.md` and `.github/copilot-instructions.md` each hold one tool's own
> quirks and close by sending you here. None points at another: a contract living
> in one vendor's file makes that vendor its owner, and these rules belong to the
> repository. None outranks this file either -- where a vendor file and this one
> appear to disagree, this one wins and the vendor file is wrong.
>
> A vendor file earns its place by being the one home for that tool's quirks, not
> by being auto-loaded, so an empty one is worth keeping: it is the address a
> future quirk already has. Do not assume any of them is discovered
> automatically, and **never add one on a model's account of its own behaviour**
> -- asked directly, one model described a root-scanning heuristic that would find
> a file named after it, then retracted it as undocumented. A self-report is a
> hypothesis; this repo does not encode hypotheses as mechanism. That is why
> `README.md` links this file: a README pointer is the one route in that does not
> depend on any tool's discovery rules.

> **Voice first.** Operate under the khai **voice layer**,
> [management_instructions.md](packages/khai-plays/management/management_instructions.md):
> who speaks, through
> which Persona, and how the company collaborates. _Then_ this file is the
> **coding contract** (branching, lanes, changesets, the gates). Voice and
> mechanics live there; coding rules live here. The two are separate layers,
> and the order matters: management voice first, coding second.

> **Case law next.** [conduct.md](packages/khai-stage/conduct.md)
> ships with `@chbrain/khai-stage` (a house reads it at
> `node_modules/@chbrain/khai-stage/conduct.md`) and is the shared
> case law for working in any khai house: how a model reads a rule, measures a
> claim, trusts a check. This file stays the short, executable contract; it
> does not restate that reasoning.

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
   **A package's FIRST release is the exception: it takes an empty changeset,
   never a bump.** `changeset version` bumps _from_ the version already in
   `package.json`, so a new package created at `0.1.0` that carries any level
   publishes at `0.1.1` and `0.1.0` never exists on the registry. The manifest
   version IS the initial version; `changeset publish` ships any package whose
   version is not yet on the registry, with no bump needed to reach it.
   `khai-guard changeset-check` computes this rather than trusting the reader.
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
   to a pointer at the owning engine, or give it a **distinct stem**, which is
   almost always the field's own compound term (`verbal_persuasion`, not
   `persuasion`; `reward_power`, not `reward`). A `memberPolicy.homonyms`
   whitelist is the **last resort, not the first offer**: it is for a word that
   genuinely carries two sciences and cannot be renamed on either side without
   losing the field's own term, and it is the maintainer's call, never
   self-granted — **and the gate now computes that.** The list is a ratchet: it
   may shrink freely, and `member-check` refuses an entry that appears without a
   recorded `granted` note. It also carries the distinct stem each remaining
   entry should take, so a change that touches an engine still holding one is
   told, at that moment, what to rename it to. Taking the offer is optional and
   always yours to price — a rename is breaking — but it is the only moment the
   cleanup is cheap. And because composites hard-link member files by name,
   **renaming or removing a member is a breaking change**: at least
   `bump:minor` (the maintainer's label), never a silent patch. Adding members
   stays patch-free. A rename that other packages link goes on the
   **`rename/<name>/<topic>`** lane, which carries the engine _and_ the
   composites that link it — the only lane that may span two, because an
   engine's blast radius is bounded to composites by construction (a composite
   links an engine; an engine links nothing outside itself). On `engine/*/*`
   the relinks cannot travel with the rename, and neither half can be committed
   without the other: the conformance kit resolves package links, so the
   composite fix is refused before the rename lands and the rename's own CI is
   red until it does.

## House voice, and it is checked

Two things the content gates enforce that no document used to state, so both a
model and a reviewer could pass them by:

- **No en-dashes or em-dashes in content.** Use `,` `;` `:` `()`, or `--`.
  `checkEncoding` raises it and `conformance.test.mjs` runs that over every real
  package, so it is a suite failure rather than a style note.
- **A member file must wire into the graph.** An engine links its own members;
  a composite links the atoms it declares. A file that links nothing is prose
  sitting in a package that claims to read over engines, and the reviewer is the
  only thing that catches it.

Where a rule here is enforced, it says by what; where it is not, it is the
reviewer's (conduct.md law 5 says why that difference is the whole value of the
sentence).

## Lanes at a glance (the full table is in docs/BRANCHING.md)

| You changed…                                                                                                                   | Lane                       |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| `packages/khai-arch/**`                                                                                                        | `arch/<topic>`             |
| `packages/khai-guard/**`, `.github/**`, `.husky/**`, `khai-guard.config.json`, this file and the vendor files that point at it | `governance/<topic>`       |
| `packages/engines/<name>/**`                                                                                                   | `engine/<name>/<topic>`    |
| `packages/composites/<name>/**`                                                                                                | `composite/<name>/<topic>` |
| renaming a member of `<name>`, **plus the composites that link it**                                                            | `rename/<name>/<topic>`    |
| `packages/khai-skills/**`, `docs/SKILLS.md`                                                                                    | `skills/<topic>`           |
| `packages/khai-methods/**`, `docs/METHODS.md`                                                                                  | `methods/<topic>`          |
| an unowned top-level file only                                                                                                 | `chore/<topic>`            |

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

The lane is **computed, not judged**: run `khai-guard branch`, obey the hook,
let the required CI check be the wall. Follow the commands above literally and
the scope takes care of itself. The reasoning (why a generic prose note fails
a weak model and a computed gate does not) is conduct.md law 5's closing
paragraph and law 8; this file states the rule, not the argument for it.
