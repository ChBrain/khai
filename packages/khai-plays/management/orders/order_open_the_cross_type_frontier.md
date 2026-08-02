---
khai: order
title: "Open the Cross-Type Frontier"
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.0.1
  date: "2026-08-02"
---

# Order: Open the Cross-Type Frontier

## Direction

The canon opens the **cross-type frontier**: engines and composites that model the
forces every khai-type experiences, not only the persona. The architecture has n
types; an engine or a composite is a **force** those types undergo; and the
inventory has grown lopsided -- of the `requires.on` wiring across the whole
library, the overwhelming majority targets `persona`, and place, piece, plan,
process, and position carry almost none. Weather works on a place, wear on a
piece, drift on a plan, momentum on a process, capture on an office -- the same
kind of thing the persona apparatus already gives a production to play, for the
other nouns the world is made of. The frontier is those verbs for the neglected
nouns.

This is not a new kind of package. A force on a place is an ordinary engine in
`packages/engines/` that declares `on: place`, gated and licensed exactly as every
engine is. The frontier is opened not by new machinery -- the `requires.on/section`
wiring is already type-generic, and conformance already reads it -- but by a
standing directive, so the roughly forty charted rows land under a ruling instead
of each re-arguing the same three questions when its turn comes.

## Orders

Every cross-type build obeys the following. They are the invariant this order sets
once; the enumerated candidates are deferred to the chart (see Implementation).

- **No new library family.** A force on a place, a piece, a plan, a process, or an
  office is an ordinary **engine** (or a **composite** over engines) that declares
  the target type in `requires.on`. It is not a new package kind, not a new lane, not
  a new content type. There is exactly one mechanism for a force, and every type
  borrows it.

- **The first-of-kind sets the shape.** No engine yet declares `on:` a cargo type
  other than persona, plot, or play. The first place, piece, plan, or process force
  to land establishes the wiring precedent for the whole frontier -- which chapter a
  force attaches to, how the link reads, how the boundary is drawn -- and earns the
  maintainer's eye the way `ptsd`'s mechanics-first shape did. Once it is merged, the
  rest of the tier follows the proven shape without re-argument.

- **The attach-chapters are API.** A force targets the target type's own chapters,
  named where the architecture names them -- a place's Shown, Holds, Offers, Withheld;
  a piece's Load Bearing, Apparent, Yearbook; an office's Has, Orders, Loses, Drives;
  a plan's and a process's own chapters. A build wires to those chapters, never to an
  invented one; a chapter that does not exist on the target type is a boundary
  question for the maintainer, not a place to improvise.

- **One phenomenon, one engine -- across types.** The rule holds the same on the
  frontier as everywhere: a force whose stem another engine already claims, or that
  restates a whole engine's domain, fails `member-check`, and that rejection is
  correct. A type-crossing does not license a homonym; the same phenomenon read on a
  new noun is still the same phenomenon.

- **Warrant is a lineage, not solo work.** Each force credits the real, citable
  science it packages -- the founders and those who built on and validated it -- in
  an Origin table, never one author and never the house's own invention. A force on a
  place borrows environmental psychology, urban studies, or acoustics as truthfully as
  a persona engine borrows its field.

- **Bound the force against the faculty it borrows.** The frontier models the force,
  not the faculty it acts through. A weather force does not re-model `space`; it
  delegates the setting-as-such to the engine that owns it and models only the moving
  of it. Every cross-type build names the neighbour it borrows against, as the rest of
  the inventory does.

- **Same gates, same discipline.** Each engine or composite lands on its own
  guard-computed lane, its own PR, its own changeset; source and tests are separate
  PRs; the maintainer alone merges and labels any minor or major bump. The frontier is
  built serially, one merged before the next, as the rest of the inventory is.

## Implementation

The frontier's **candidate chart** already stands in `docs/ENGINE-GAPS.md` under the
Tier F cross-type map -- place, piece, plan, process, position, pitch, and
performance, each row carrying its phenomenon, its warrant lineage, the chapter it
attaches to, and a confidence flag, exactly as the other tiers record the backlog.
Execution is deferred to that chart and to each candidate's own lane; **no build
moves inside this order.**

The proof that opens the frontier is named and deferred, not built here:

- **`place/weather`** (engine) -- the first force to declare `on: place`, wiring a
  setting's own chapters to the moving of it (climate, storm, season as a force a
  place undergoes). It is the first-of-kind: it sets the `on: place` wiring precedent
  the whole tier inherits, and it takes the maintainer's eye before it lands.

The first cross-type **composite** is deferred a step further than the clinical
tier's was: `cptsd` could read over atoms that already existed, but a composite over
place-forces (or piece-, or office-forces) has no atoms until the tier's first
engines land. So the tier's second proof is a **second engine on a different cargo
surface** -- proving the wiring generalises rather than fires once -- and the first
cross-type composite waits until a surface carries enough force-atoms to read over.
The maintainer names that second surface on approval.

The maintainer approves the chart before build and labels every bump; the Choregos
revisits this order only if the frontier's scope or invariant changes, not per
candidate. Each row then builds to the usual standard on its own lane.

## Targets

- [x] the cross-type frontier is named and opened: forces toward every khai-type, not
      only the persona, distinct from the persona-saturated inventory the library has
      grown
- [x] the no-new-family rule is set: a force on any type is an ordinary engine or
      composite declaring `requires.on`, not a new package kind, lane, or content type
- [x] the first-of-kind rule is set: the first `on:` a non-persona/plot/play cargo
      type establishes the wiring precedent and takes the maintainer's eye, as `ptsd`
      did for mechanics
- [x] the attach-chapters-are-API rule is recorded, with the per-type chapter sets
      named where the architecture names them
- [x] one-phenomenon-one-engine is held across types, and the warrant-is-a-lineage and
      bound-against-the-faculty rules are carried onto the frontier
- [x] the enumerated candidate chart is deferred to `docs/ENGINE-GAPS.md` under the
      Tier F map -- approved by the maintainer, each row built on its own lane; no
      build moves inside this order
- [x] the opening proof is named and deferred: `place/weather` as the first-of-kind
      `on: place` engine, with the second proof a second cargo surface and the first
      cross-type composite deferred until a surface carries atoms to read over
