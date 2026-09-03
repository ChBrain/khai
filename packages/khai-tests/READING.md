---
khai: design-of-record
title: "Reading a house from outside"
status: proposed
license: CC-BY-NC-SA-4.0
---

# Design of record — reading a house from outside

The answer to the website's problem statement _"The house the consumer cannot
see"_ (khai-website, 2026-09-03). That statement asks for no API and proposes no
field; it asks where the answer lives. This is that answer, plus the deltas each
repository in the chain owes.

> Scope note. The engine work lands in this repository, governance lane
> (`packages/khai-house/**`, `packages/khai-tests/**`). The downstream sections
> are the contract the cultures house and the website implement against, recorded
> here for the paper trail exactly as [REGISTRY.md](REGISTRY.md) records its own.

## The short answer

**Where a unit lives is a consumer-facing concern of the kit, and the registry is
already most of the way to self-sufficient.** The split is clean, and it is the
one the chain already runs for plays: the registry is self-sufficient about
_identity and content_ — for every entry, what it is, which files it holds, and
which **package addresses** them — and one shared implementation owns the last
step, **address → path on disk**, because that step needs the installed tree and
npm's own resolver is the only correct answer there.

Nothing in the chain may construct a path to a unit again. Not the website, not a
`kind: canon` play repo, not the house itself. `@chbrain/khai-plays` already
proved the shape: a card names `house.package`, the website does
`require.resolve(`${pkg}/package.json`)`, and the migration this statement is
about never touched it — because that consumer was never told where files were,
only which package to ask.

The cultures registry does not yet say that for 269 of its 316 entries. It says
it for the 47 migrated ones, and says **nothing** for the rest, leaving the
consumer to supply the rule _"absent `package` means the umbrella's collection
directory."_ That implicit rule is the whole bug. It is the failure
`tests/culture_sources.mjs` names in its own header, seen from the other side:
absent-means-something is indistinguishable from a reader that understood.

So the first delta is not an API at all. It is **symmetry**.

## The seam: `source`, on every entry

Every registry entry, both kinds, migrated or not, in every khai house, gains:

```jsonc
// an umbrella unit
"source": { "package": "@chbrain/khai-cultures", "path": "cultures/austria" }
// a migrated unit
"source": { "package": "@chbrain/khai-cultures-austria", "path": "" }
// a house that has never migrated anything (khai-misfits, all 330)
"source": { "package": "@chbrain/khai-misfits", "path": "misfits/kafka" }
```

`package` is an npm name a consumer resolves. `path` is a POSIX path below that
package's root; `""` is the package root itself. Required on every entry, and
required by `validateCollectionRegistry`, so a reader that does not understand
`source` gets a hard failure rather than 269 quiet successes.

This is the whole producer/consumer seam. The producer **writes** it, from a
worktree, knowing where it put things. The consumer **reads** it, from an
installed tree, and asks npm for the rest. Neither side ever constructs the
other's path, and the ratchet can move a unit any number of times without a
consumer noticing, which is the property the current arrangement lacks.

The existing `package` field stays for one minor as a deprecated mirror of
`source.package`, then goes. It is read today by the house's own packing test,
which moves to `source.package` in the same change.

## The reader: `@chbrain/khai-house`

A new package. Pure node, **zero runtime dependencies**, and deliberately not a
new export of `@chbrain/khai-tests`.

Two reasons it is its own package rather than a module of the kit. The kit is the
_producing_ vantage: it walks a workspace, reads git, and pulls the whole
validator toolchain (`khai-arch`, `khai-language`, `khai-pack`, `khai-rules`,
`khai-stage`) to do it. A website prebuild that only wants to list a house should
not install a validator, and today the website does not install the kit at all.
And the kit is `access: restricted` where a house is `public`; a consumer of
public content should not need a restricted dependency to read it.

The symmetry is the point, not the accident: `khai-tests`' `resolveHouse` answers
_"where does a unit live"_ **from a worktree, by walking the workspace**;
`khai-house` answers the same question **from an installed tree, by reading the
registry and asking the resolver**. One vocabulary — `source` — two vantages.

```js
import { createRequire } from "node:module";
import { openHouse } from "@chbrain/khai-house";

const house = openHouse("@chbrain/khai-cultures", {
  resolve: createRequire(import.meta.url).resolve,
});

house.version; // "0.316.0", from the installed manifest
house.units(); // every unit, resolved — throws if any is not
house.units({ partial: true }); // { resolved, missing } — the loss, opted into
house.groups(); // referencing entries, references resolved
house.filesOf(unit); // [{ file, role, path }]
house.read(unit, file); // Buffer
house.linkTarget(href, unit); // { unitId, file } | { external } | null
house.verify(); // findings: registry vs installed tree
```

**`resolve` is injected, never imported.** A resolver called from inside
`khai-house` resolves against `khai-house`'s own `node_modules`, which under
hoisting is right by luck and wrong the first time it is not hoisted. The
consumer's module is the only correct resolution root, so the consumer passes it.

**`units()` fails closed.** This is the line that closes the whole class:

```
openHouse(@chbrain/khai-cultures@0.316.0): 47 of 316 units are not installed
(austria, ch_aargau, ch_appenzell_ausserrhoden, ...): each names a package in
its registry entry's `source`, declared as a dependency of the house, that this
module cannot resolve. A producer that continued here would ship 269 units and
report success.
```

A caller that genuinely wants a partial house asks for one and gets the missing
list to print. Silence is not on the menu. This mirrors `cultures()` in the
house's own resolver, which refuses to be empty for exactly the same reason,
and it is the direct answer to _"a producer that ships too little and calls it
success."_

## What a unit's content is: an allowlist, not a denylist

**A unit's content set is discoverable from the house, and the registry already
carries it.** `members[]` on every entry is the play canon of that unit — every
`persona_`/`piece_`/`plot_`/… file, with its kind, title and taxonomy — derived
by the kit from the unit's own directory, and it is built identically for a
migrated unit and an umbrella one. Nobody noticed, so the website walks the
directory instead.

`filesOf(unit)` returns each file with a **role**:

| role        | what                                       |
| ----------- | ------------------------------------------ |
| `member`    | a file listed in the entry's `members[]`   |
| `doc`       | `README.md`, `REFERENCES.md` — closed set  |
| `sidecar`   | `geo.json` — already folded into the entry |
| `packaging` | the complement: everything else            |

**A file is content if and only if its role is `member` or `doc`.** `packaging`
needs no list and is never enumerated — `package.json`, the licence pair,
`CHANGELOG.md`, `playwright_instructions.md`, `coverage-waivers.json`, and
whatever the packaging grows next, all fall out of it without a consumer
changing. The website's current rule is the inverse — take the directory, skip
`geo.json` — and inverting it is precisely why that rule breaks against a package
root and would keep breaking as the packaging grows.

The licence collision the statement raises dissolves here: a package's
`LICENSE`/`LICENSE-CODE` are `packaging`, never content, so a consumer placing
the house licences itself never sees the per-package pair.

And a file on disk that is khai-prefixed but absent from `members[]` — or listed
in `members[]` and absent from disk — is neither content nor packaging. It is
**drift**, and `verify()` reports it. That is the same question as Q4, asked one
level down.

## Links: one rule, both shapes

A house at any mix carries both shapes at once today — `nordics` casts
`../../cultures/denmark/play_denmark.md`, `dach` casts
`@chbrain/khai-cultures-germany/play_germany.md` — so any consumer that resolves
or rewrites a link needs one rule that reads both.

`linkTarget(href, unit)` is that rule, and it lives in `khai-house` because
**the kit needs it too**. `referencedIds` in `src/registry.mjs` resolves relative
targets under the collection directory and nothing else, which is exactly why
DACH's references derived empty. The kit imports the rule from `khai-house`
rather than keeping a second copy, on the same argument that moved the relink
rule out of the cultures house: two implementations of one rule diverge.

## What a group whose members have left the umbrella is

**A group. Unchanged.** DACH is not a design question; it is that one blind
derivation. `references` is derived from the group play's casts, the casts are
still there and still gated by `checkLinks`, and the derivation simply stopped
recognising them the moment they became specifiers. Teach `referencedIds` the
package-specifier shape via `linkTarget` and DACH derives
`["austria", "germany", "switzerland"]` again, wherever those three live.

The second half matters more than the fix. **A referencing entry that derives
zero references becomes a build error**, not an omitted field:

```
groups/dach: play_dach.md casts no member of `cultures`. A group is defined by
what it references; one that references nothing is a derivation that has lost
its members, not a group that is empty.
```

One line, and 0.316.0 does not publish. This is the single highest-value change
in the document: it would have caught this before the website ever looked.

Group-as-one-zip stays where [REGISTRY.md](REGISTRY.md) left it — website-side,
deferred. Once references derive again, the website's existing group loop packs
the DACH set with no new design at all, because its members resolve like any
other unit.

## Whose job it is to say the registry and the tree disagree

**The kit provides the check; the consumer runs it and owns the severity.** The
registry is a snapshot of a source tree at publish; the installed tree is what is
actually there, and they can disagree without anyone lying — a partial install, a
stale lockfile, a dependency npm did not place where the umbrella expected.

`verify()` returns findings in two classes:

- **unresolvable** — an entry's `source.package` will not resolve from the
  consumer's module. `units()` already throws on this; `verify()` is how a
  caller inspects it without the throw.
- **drift** — a resolved unit's files disagree with its `members[]`, in either
  direction.

The count assertion rides along and is the cheapest guard in the set: the
registry says 316, the resolver resolved N, and N ≠ 316 without an explicit
`partial` is an error naming every lost id.

## An invariant this exposes, worth pinning now

`require.resolve("@chbrain/khai-cultures-austria/package.json")` works today
because that package declares no `exports`. The day one does, every subpath
resolution in the chain — this reader's, and every package specifier a migrated
unit casts at a sibling — stops resolving, silently, for consumers only. The
workspace would keep passing.

`validateProductionPackage` gains one rule: **a production package either
declares no `exports`, or exports `./package.json`.** `khai-tests` and
`khai-pack` already do the latter; the workspace learned this once and the
production packages have not been held to it.

## What this does not change

Nothing in the ratchet, nothing in the umbrella's version arithmetic, no content.
The design holds at both ends of the walk by construction: khai-misfits has
migrated nothing and gets `source` on all 330 entries pointing into its own
tarball; a house that has migrated everything gets 316 entries pointing at 316
packages; and the reader cannot tell the difference, which is the test.

A `kind: canon` repo drawing on **one** culture as material does not need this
reader at all — it declares `@chbrain/khai-cultures-germany` and casts the
specifier, and npm checks it. That was always the point of the migration. The
reader is for the consumer that enumerates the **whole** house: the website, and
the next producer like it.

---

## Deltas by repository

### Engine — this repository (governance lane)

Source-first, then dormant tests, as the source/test gate requires.

1. **New package `@chbrain/khai-house`.** Pure node, no runtime deps, published
   `public`. `openHouse`, `units`, `groups`, `filesOf`, `read`, `linkTarget`,
   `verify`, `ROLES`. Fails closed by default.
2. **`buildItems` emits `source` on every entry**, both kinds, in
   `src/registry.mjs`. Generic — every house gets it, not just cultures.
3. **`referencedIds` delegates to `linkTarget`**, so a cast reads whether it is a
   relative path or a package specifier. `khai-tests` takes a dependency on
   `khai-house` for the rule.
4. **A referencing entry with zero derived references is a build error.**
5. **`validateCollectionRegistry` requires `source`** and accepts the deprecated
   `package` alongside it for one minor.
6. **`validateProductionPackage` pins the `exports` invariant.**

### Downstream — khai-cultures

7. `registry_hybrid.mjs` injects `source` where it injects `package` today.
   Its header's claim that _"nothing about what an entry looks like is decided
   here"_ becomes true again when the kit emits both halves; folding the hybrid
   build into the kit outright is a separate RFC, because it moves the
   version-count derivation with it.
8. The packing test reads `source.package` instead of `package`.
9. Rebuild, and DACH's references come back. Publish `0.317.0`.

### Downstream — khai-website

10. `buildCultureDownloads` drops `culturesDir`, the `readdirSync(cultureDir)`
    walk, and the `geo.json` read (`iso` is on the entry; no entry carries
    `parent` today), and reads `openHouse` + `filesOf` instead.
11. The `no cultures/<id>/ directory; skipping` line goes. `units()` throws.
12. `deps:sync` to `^0.317.0`. Note the current `^0.286.0` is a real pin: caret
    on a `0.x` range admits patches only, and the minor **is** the culture count,
    so this repository has never picked up a culture except by an explicit sync.
13. A smoke test asserts `available.json`'s entry count equals the registry's,
    and that every group entry carries at least one reference. After that, a bump
    that drops a culture is red, not quiet.
