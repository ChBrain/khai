---
khai: order
title: "Open the Production Layer"
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.0.1
  date: "2026-08-25"
---

# Order: Open the Production Layer

## Direction

The canon adopts a **third package layer**: the **production**, one khai play
published on its own, so a house can be drawn on a play at a time instead of
whole.

The question came from the Cultures house, which is registered here as
`kind: canon` and glossed by this registry as _plays other productions draw on
as material_. Nothing draws on it. A play staged in its own repository and set
in Bavaria must today depend on all 290 cultures, 14.6 MB, to cast one, and no
house has ever tried: `khai-plays-buechner` depends on the spine engine and
nothing else. The promise on the card has never been exercised, and the
all-or-nothing dependency is the reason.

**The answer is yes, and the reason it is yes is that the alternative does not
carry the constraint.** The fallback the Cultures design named was per-item
delivery through khai-pack, which already serves `culture` as an example bundle
kind. khai-pack ships **bytes**; what the split exists for is a **reference npm
can check**. `checkLinks` already resolves `@scope/name/member.md` only through a
declared dependency and fails closed otherwise, which is exactly the material
relationship the card advertises, and a zip cannot be a declared dependency. So
khai-pack remains the right way to hand somebody a culture and is not a way to
let a play depend on one.

**A house may therefore publish more than one package, and the house registry
does not change.** That is the second half of the answer and it is a smaller
change than it looked: a card's `package` is what the website pulls, the house
keeps its umbrella, and the umbrella's `dependencies` already **are** the list of
its productions. A `packages[]` array on the card would be a hand-kept list, in
khai, of things that live in another repository -- the very thing this registry's
own comment says it cannot see at build time -- so it would be right on the day
it was written and drift on the next merge. One package on the card, computed
parts behind it.

## Orders

- Owner: [The Choregos](../position_choregos.md)

## Implementation

**The class is not a new word.** khai-arch classes every type `house`, `element`
or `meta`, and `house` is the class of the two types that make a play (play,
plot). `manifest.class` has always drawn on that vocabulary: the spine engine
declares `meta` because its members are meta-class instances, and a content
engine declares nothing because its members are elements. A package whose members
are a play declares **`class: "house"`**, and the third layer arrives with no
addition to the canon's vocabulary at all. The layer's _name_ is "production",
which is what the houses call it; a layer name has never been a class value.

**The manifest.** `khai.class: "house"`, `khai.production: "<id>"`, and
optionally `khai.anchor` (defaulting to `play_<id>.md`). A production declares
**no `khai.engine`**, and that absence is load-bearing: an engine's manifest
imposes wiring law on whoever installs it, and a house installing 290 cultures
to cast one must not inherit 290 sets of requirements. Its productions and its
engines are told apart by the same field.

**The validator**, `validateProductionPackage` in khai-tests, checks the manifest,
one publish invariant, and nothing else before handing the content to the
ordinary consumer validator. It carries neither the WIRES card nor the generated
README, for the reason the meta engine does not: a production is wired into no
chapter. It also carries **no LORE warrant**, which is the one place this differs
from the composite contract and was found by building it: LORE justifies a domain
modelled from a literature, and a production is a staging whose sources are the
house's business. The houses do not agree on that shape -- a culture's
`REFERENCES.md` carries Hofstede data and historical sources, a misfit's
`REFERENCE.md` carries an Origin table -- so a warrant imposed here would override
a house contract khai cannot see.

**The publish invariant: no `../` in any shipped markdown.** This is the one new
check and it is not redundant with the broken-link check, which is the whole
reason it exists. A culture sitting beside its siblings in a working tree
resolves `../france/position_language_fr_fr.md` perfectly, so the link check
passes, reports clean, and the published tarball is broken. The invariant sees
what the link check cannot: that the neighbour is not in the package.

**One repair the proof turned up, and it was a gate reading true for the wrong
reason.** Package-specifier links resolve by walking up through `node_modules`;
installed **engines** were found by scanning the one directory beside the root.
A workspace hoists installs to the workspace root, so a package validated on its
own directory had no local `node_modules`: its package links resolved and its
wiring links all read as broken, while the same package validated from the
workspace root had its wiring links resolve and every package link fail. Neither
root gave a true reading of the same package. `installedEngineManifests` now
unions the flat scan with the engines the root's own package.json declares,
resolved by the same walk the links use -- one notion of "installed", used by
both checks.

**Proven end to end on one real production** before this order was written:
Bavaria, extracted from the Cultures house with its language positions moved out
to a tongues package and all eleven links rewritten to package specifiers. It
validates clean as a production; drop the dependency and all eleven fail closed
with the reason. It packs to 29 files with zero `../`, and the **installed
tarball** validates clean from inside another package's `node_modules` -- and
fails with eleven findings the moment a dependency is removed, so the pass is not
vacuous. A consumer package in the same workspace links into it and is held to
the same rule. Nothing was published; the proof stops at the tarball.

**What is left to the houses.** Naming is the house's (`@chbrain/khai-cultures-<id>`
and its siblings are frozen by the Cultures house, not renegotiable here). The
umbrella keeps the count, and after the split it takes it from its **production
dependencies** rather than from directories on disk, which is a strictly better
reading: a count taken from the manifest is in the diff and cannot be inflated by
an untracked directory left in the tree. That change belongs to the pass that
retires the tree, not to this order.

## Targets

- [x] Answer the canon question: a house may publish more than one package, and
      the third layer is the production, one play published on its own
- [x] Establish why khai-pack is not the alternative: it ships bytes, and what
      the split needs is a reference npm can check
- [x] Fix the discriminator on the canon's own class vocabulary (`house`), so
      the layer arrives with no new word
- [x] Fix the manifest: class, production id, optional anchor, and no
      `khai.engine`, so a production imposes no wiring law on its consumers
- [x] Fix what the validator does NOT carry: no WIRES card, no generated README,
      no LORE warrant, and why the warrant is the house's
- [x] Add the publish invariant, the one check the broken-link check cannot make
- [x] Repair the two disagreeing notions of "installed", found by the proof
- [x] Prove it end to end on Bavaria: validate, workspace-link, pack, install the
      tarball, and fail closed on a removed dependency
- [x] Leave the house registry card unchanged, and record why a `packages[]`
      array would be a list khai cannot see
