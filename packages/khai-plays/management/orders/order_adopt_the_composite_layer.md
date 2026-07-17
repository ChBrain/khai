---
khai: order
title: "Adopt the Composite Layer"
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.0.1
  date: "2026-07-17"
---

# Order: Adopt the Composite Layer

## Direction

The engine catalogue adopts **two layers, one mechanism**: atoms and
composites, both ordinary npm packages.

**Atoms** (`packages/engines/*`, this repo) stay research-shaped: one research
line, one engine, one phenomenon owned from one party's side (guilt is the
transgressor's, forgiveness is the wronged party's, repair is the dyad's).
Depth comes from graded ladders inside the boundary, the way language grades
its channels, never from absorbing a neighbour's ground. Atoms must not
overlap: a member file that restates another engine's phenomenon is mud, and
mud is computable.

**Composites** (a separate house, `khai-engines-composites`) hold the whole
readings the atoms refuse: a composite declares atoms as `dependencies`,
ships only an integrative root and thin bridge members, and links **into**
its dependencies with hard, package-resolved references, the link target
written as package plus member file:
`@chbrain/khai-engine-guilt/process_guilt.md`. npm supplies the
rest for free: semver pins what every link means, the lockfile makes it
reproducible, transitive install turns the atoms' wiring laws on, and the
dependency graph doubles as the citation graph. A composite adds without
altering: it wires over the atoms, it never restates them.

The holistic engine and the atomic engine stop being rivals. Holism is what
the composite layer produces; the atoms stay clean enough to be worth
composing.

## Orders

Adopt the design; move nothing yet. This order records the shape and the
impact so every later change lands under a directive instead of a judgment
call. Execution is deferred to its own lanes, each on the Choregos's go:

- The **member-collision gate** (khai-guard, `governance/` lane): fail a PR
  whose new member collides, same file name or same stem, with another
  engine's member or name, homonyms whitelisted. Non-overlap is what
  composites stand on, so the gate precedes them.
- The **bump rule** (contract docs, `governance/` lane): once composites link
  member files, a member rename or removal is a breaking change, at least
  `bump:minor`, never a silent patch.
- **Package-specifier link resolution** (khai-tests, `governance/` lane):
  resolve cross-package links through `node_modules`; a link into a package
  the composite does not declare as a dependency is a build failure.
- **Atom deepening** (each engine's own `engine/` lane): enrich inside the
  party boundary only, guilt gains transgression kinds, weight grades,
  proneness, refusal; it does not gain confession, amends, or release, which
  belong to repair and forgiveness and, joined, to a composite.
- **Promotion, not deletion** (paired `engine/` lanes + the composite house):
  where an atom carries another phenomenon's member, thin it to a pointer and
  move the family reading up into a composite. Nothing is lost; the claim
  moves to the layer whose job it is.

## Implementation

The mud map this order answers, computed from the manifests on main
(2026-07-17). Fresh duplicates, introduced by the July engine batch:
guilt (`shame/process_guilt.md` vs the guilt engine), jealousy
(`envy/process_jealousy.md` vs the jealousy engine), absorption
(`time-perception/position_absorbed.md` vs the flow engine). Standing
overlaps, pre-dating the batch: planning (executive-function vs
implementation-intention), ascent (hierarchy vs status-move), exploration
(curiosity vs play-mode), the account (trust's repair member vs the repair
engine). Homonyms to whitelist, same word, different science: bearer,
emotional, resolution, loyalty, reward, pride, envy, contagion.

Seven clusters stand for composite review: self-conscious emotions
(shame · guilt · pride), the moral account (guilt · repair · forgiveness ·
betrayal), standing (hierarchy · status · status-move · capital · power),
absorption (flow · time-perception · attention), exploration (curiosity ·
play-mode), passage (ritual · liminality), planning (executive-function ·
implementation-intention · goal).

Mechanics the layer needs, and nothing more: one khai-tests change (resolve
package-specifier links, fail undeclared ones), one khai-guard check (the
collision gate), one documented bump rule. No khai-arch change: the WIRE
contract, `compositionOrder`, and the manifest schema stand as they are; a
composite's `index.mjs` imports its atoms and splices in plain code. The
first composite to cut is the moral account, the seam this order was mapped
on.

## Targets

- [x] the two-layer design is recorded: atoms research-shaped and
      non-overlapping, composites as dependent packages with hard links
- [x] the impact on existing engines is enumerated: collision gate, bump
      rule, link resolution, party-boundary deepening, promotion pattern
- [x] the mud map is computed and carried in this order: three fresh
      duplicates, four standing overlaps, the homonym whitelist, seven
      composite-review clusters
- [x] all execution is deferred to its own lanes under the Choregos's go;
      no engine content moves in this order
