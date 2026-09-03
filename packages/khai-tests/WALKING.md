---
khai: design-of-record
title: "The build walks the house, not a directory"
status: proposed
license: CC-BY-NC-SA-4.0
---

# RFC — the registry build walks the house, not a directory

`buildItems` finds a house's items with one `readdirSync` of the collection
directory. That was the whole truth when a unit could only be a subdirectory. It
has not been the whole truth since the first migration ratchet moved a unit into
its own package, and every consequence below follows from the kit continuing to
ask a question whose answer it already knows how to compute.

The kit has the house-agnostic answer and is not using it. `resolveHouse` and
`unitsOf` (`src/house.mjs`) find a house's units in **both** shapes — a
subdirectory of the collection, and a package standing beside it declaring
`khai.class "house"` — keyed on what manifests say and never on a directory
name. Every gate in this kit already goes through them. The registry build does
not.

> Scope. This proposes moving the registry build onto `unitsOf`. It does not
> propose the `entries[]` flattening deferred in [REGISTRY.md](REGISTRY.md),
> which is a separate registry-format question.

## What the directory walk costs today

Not hypothetical. Every item below is load-bearing code that exists because the
build can only see half a house.

**A whole parallel reconcile downstream.** `khai-cultures` carries
`tests/registry_hybrid.mjs`: it runs the kit's build over a scratch tree
assembled from the migrated packages, lifts the entries out, merges them with
the umbrella half, and rewrites the file. Its own header says why — the kit
"counts directories, so lifting a culture out made it derive 0.289.0", and a
minor that goes **down** is a version already published. That file is the shape
of a house working around the kit rather than using it.

**The version count fights the house's identity.** For that house the minor _is_
the unit count, and the walk moves files rather than cultures. A build that
counts directories therefore computes a number that shrinks as the house grows.
The reconcile exists to put it back.

**The build and its own verify disagree.** `buildRegistry` calls
`verifyRegistry`, which rebuilds via `computeRegistry` and compares. Both see
the same half-house, so they agree by accident — until a group's members
migrate, at which point the rebuild derives no references and trips the kit's
own empty-group rule. The build succeeds and the verify of that same build
errors. Three findings are dropped in `khai-cultures`' `house.test.mjs` for
exactly this reason, each with a comment explaining that the kit's drift check
is _replaced_ rather than waived — because leaving it in would mean a house with
no drift check at all.

**A house must hand the kit a map it could read itself.** `packageIds` (npm name
→ unit id) is passed in because the link rule cannot resolve
`@chbrain/khai-cultures-germany/play_germany.md` without knowing which package
is which unit. The kit does not build that map, and the reason given is sound as
far as it goes: the _naming rule_ is the house's. But the kit does not need the
rule. `unitsOf` already resolved every production and holds its npm name, read
off its manifest. The map is derivable from what a resolved house knows.

**`source` is stamped wrong and then corrected.** The build stamps
`source: { package, path }` from the tree it can see, so a migrated unit gets
the umbrella's name and a `cultures/<id>` path — both false. The house
overwrites it afterwards. A field the producer must correct after the producer
wrote it is a producer that was not given what it needed.

## The proposal

`buildItems` takes its items from `unitsOf(house)` rather than from
`readdirSync(collection.dir)`. Everything downstream of "here is a unit and its
directory" stays exactly as it is: the anchor parse, the description fallback,
the `geo.json` sidecar, the members catalog, the entry sort.

Five things fall out, and none of them is new machinery:

1. **A complete registry at any mix**, including both ends of a one-way walk —
   none migrated, all migrated.
2. **`source` stamped right the first time.** `unitsOf` knows whether a unit is
   a directory under the collection or a package that _is_ the unit, so
   `{ package, path }` is a fact the build already holds rather than one a house
   patches afterwards.
3. **The count becomes units, not directories** — which is what a house whose
   minor is its unit count has been reconciling toward all along, and a no-op
   for a house that has migrated nothing.
4. **Build and verify see the same house**, so the drift check is meaningful
   again and the dropped findings can go.
5. **`packageIds` becomes derivable** from the resolved house, so the one place a
   house currently has to tell the kit something disappears.

## This keeps the kit house-agnostic

Worth stating plainly, because it is the constraint that governs this kit: khai
knows _which houses exist_ (the bill, `@chbrain/khai-plays`); khai's **tools must
not know anything about a particular house**.

Nothing here learns a house's rules. `unitsOf` reads npm names off manifests, the
same way `resolveHouse` does today for every gate in this kit. A production is
recognised by `khai.class "house"` with a `khai.production` id — a declaration,
not a name pattern. Cultures' convention (`de_bavaria` →
`@chbrain/khai-cultures-de-bavaria`) stays entirely inside Cultures, unread. The
change _removes_ house knowledge from the seam rather than adding it: today a
house must hand over a map computed from its own naming rule, and afterwards it
need not.

## The wrinkle that decides the API

`computeRegistry(root)` is called with the **house package directory** — for
Cultures, `packages/khai-cultures`. `resolveHouse` finds productions via
`workspacePackages`, which reads that directory's own `workspaces` field. The
house package declares none, so resolving a house _from the house package_ finds
the house and **zero productions**: the productions are siblings, one level up.

So the build cannot simply call `resolveHouse(root)` and keep its current
argument. It has to be given the workspace and resolve the house within it —
exactly the distinction `khai-cultures`' `culture_sources.mjs` already draws
between `WORKSPACE` and `HOUSE`, generalised into the kit.

Concretely, and this is the part to argue about:

```js
computeRegistry(workspace, { name }); // resolve the house within a workspace
computeRegistry(root); // today's call, a flat house
```

A flat house (no workspace, collection right under the root) must keep working
unchanged — `resolveHouse` already falls back to that layout, and khai-misfits
is the live case: 330 units, nothing migrated, and it should see no difference
whatsoever.

The ambiguity guard matters here too. A workspace can hold more than one manifest
declaring a collection — Cultures ships its tongues as exactly that — so
`resolveHouse` requires `{ name }` to pick one. The build inherits that
requirement, and inheriting it is correct: guessing which of two collections is
the house is how a build certifies the wrong tree.

## What has to be decided

- **Signature and compatibility.** Does `computeRegistry` grow a workspace-aware
  overload, or does a new entry point take the workspace and the old one stay for
  flat houses? A published API with downstream callers should not change shape
  silently.
- **The version count.** Moving from directories to units is a _correction_ for
  a migrating house and a no-op for a flat one, but it is still a change in what
  a published minor means. It needs to land in the same release as the house that
  wants it, or a house mid-reconcile will compute two different numbers on two
  successive days.
- **Emptied source directories.** A `git mv` can strand an anchorless directory.
  `unitsOf` already ignores those and `emptyUnitDirs` reports them, so the build
  inherits the right behaviour — but it should be asserted, not assumed.
- **Determinism.** Items are currently pushed in sorted directory order and the
  code relies on that for a stable file. `unitsOf` sorts by id; the entry sort
  must stay explicit rather than incidental.
- **What retires downstream, and when.** `registry_hybrid.mjs` loses its reason
  to exist, and its `write`/`drift`/`hybrid` are wired into that house's release
  script and gates. That is a follow-up in the house, not a rider here.

## What this does not propose

No change to the entry contract, no `entries[]` flattening, no new field. No
change to what a unit's content is. And no change to any house's own rules —
this RFC's entire purpose is that the kit stop needing to be told them.
