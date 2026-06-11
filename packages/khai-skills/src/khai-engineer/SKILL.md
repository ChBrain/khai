---
name: khai-engineer
description: "In khai-engineer mode you become the engineer and work a khai engine end to end. Mode A (create) builds a new engine: its anchor, its members, its manifest, its Playwright wiring guide, and the weave that ties them. Mode B (audit) reviews an engine against the contract and returns findings with a verdict. Mode C (repair) fixes and improves a flat or weak engine, adding the missing ties and lifting the content, without rewriting it. The shared contract is the weave: one anchor that names the engine, every member tied down from it and back up to it, and siblings tied across to each other, all woven in prose. Use when creating, auditing, reviewing, repairing, improving, or wiring a khai engine."
license: CC-BY-NC-4.0
---

# Engineer

In khai-engineer mode you are the engineer: you create khai engines, audit them,
and repair them. A khai **engine** is a small set of element files (processes,
positions, pieces, places) that describe one moving part of a persona, declared
by a manifest and tied into one connected whole.

Pick the mode first:

- **Mode A, create** : build a new engine from nothing.
- **Mode B, audit** : review an existing engine and report on it.
- **Mode C, repair** : fix and improve an engine that is flat or weak.

All three serve one contract, the **weave**. Audit measures it, create
establishes it, repair restores it. Learn the weave first; the modes follow.

## What an engine is

An engine is a directory under `packages/engines/<name>/` with:

- **Element files**, authored from the canon templates bundled with this skill:
  [process](references/template_process.md), [position](references/template_position.md),
  [piece](references/template_piece.md), [place](references/template_place.md). These
  carry the content. Each opens with a `## Taxonomy` slot: the classification slot,
  the group directly above this element (its immediate parent), named and linked if
  it has its own file. Keep it terse: it is not the element's own name (the H1) or
  its origin (Owner).
- **A manifest**, the `khai` block in `package.json`, the single source of truth
  for how the engine wires. It comes in two shapes:
  - **process** : declares `members` as a tree (`file`, `type`, `parent`). The
    **anchor** is the member whose `parent` is null (the root).
  - **position** : declares an `anchor` file directly, with its variants under
    `expressions` (a name to file map).
  - Both also declare `engine`, `tagline`, `type`, the `requires` (the wiring
    altitudes, usually two: a law in Instructions Knowledge linking the anchor,
    and a link a persona carries under Projection), and a `card` (the reference
    card: `wire`, `issue`, `require`, `enforce`, `setup`).
- **Boilerplate** the runtime owns: `index.mjs`, `vitest.config.mjs`,
  `package.json` shell, `CHANGELOG.md`. Copy these from an existing engine; they
  do not vary.

The conformance kit (`@chbrain/khai-tests`, run by a tool-capable runtime)
checks **structure**: the manifest is well formed, every member file exists and
matches its type, the tree composes. You own **judgment**: that the content is
true, and that the weave holds. The kit never fails the weave or the prose, so
it is yours to get right.

## The weave: four ties

An engine is wired when all four ties hold. Each tie is a markdown link
(`[text](file.md)`) embedded in a sentence that means something, never a bare
"See also" list.

1. **Anchor reaches down.** The anchor's prose names and links **every** member,
   so a reader who opens only the anchor learns the whole and can step into any
   part.
2. **Members reach up.** **Every** member's prose links back to the anchor, so a
   reader who lands on a leaf can climb to the whole it belongs to. This tie is
   often already present as the structural reference a member carries to its
   parent (its `## Taxonomy` link, or its `parent` in the manifest): credit it
   where it holds, rather than adding a second up-link.
3. **Siblings reach across.** Members that share a parent link to **each other**
   where their meanings touch: a contrast, a boundary, a handoff, an order. Each
   member ties to at least one sibling. Siblings are where an engine stops being
   a star and becomes a web. The richest source is the **transitions** between
   members: how one becomes another under pressure (a status collapses into the
   next, a stage hands off, a place gives onto a place). These transitions are
   usually already named in the prose as bare concepts ("falls toward search or
   drift", "forecloses on it"); turn the named concept into the link.
4. **No orphan.** No content file is left unlinked in either direction. A file
   that neither links nor is linked is off the weave: tie it in or cut it.

The anchor-and-spokes (ties 1 and 2) is the floor. The sibling web (tie 3) is
the bar: a flat engine has the spokes but no web, or worse, not even the spokes.

## The Playwright wiring guide

Every engine ships a `playwright_instructions.md`: a `khai: instructions` file
(HACKS) that explains the engine's model so an LLM **Playwright** wires it into a
play from understanding, not from a recipe. It is dev-steering, not runtime
content: it never goes on tour, and the conformance kit **requires** it of every
engine (the meta engine included). It spells HACKS, five chapters. Write the
**why**, the reasoning a Playwright needs to grasp the engine, never the explicit
placement for one play.

There are two wirings, and only one is the Playwright's to perform:

- **The law into Knowledge is the Roadie's, and it is locked.** On deploy the
  Roadie plumbs each engine's declared law into the Instructions Knowledge
  chapter. This always happens, automatically. State it as fixed; never ask the
  Playwright to do it.
- **The type wiring is the Playwright's.** The Playwright links the play's own
  content to the engine by anchoring on the khai type(s) the engine fits. **The
  engine files stay untouched:** the Playwright wires by linking _from the play_,
  never by editing the engine.

### The chapter contract

- **Human** : the human's steering, what the human sets for this engine.
- **Agent** : what the Playwright does, the anchors it casts (which khai type,
  read how, across what).
- **Collaboration** : where the Playwright needs help, the neighbouring engines a
  meaning belongs to, the scene, and the team's review.
- **Knowledge** : the engine explained, its model and the why behind it. This is
  the chapter that teaches.
- **System** : the technical do and do-not, closing on the two constants: engine
  files stay untouched, and the guide does not go on tour.

### Where to anchor

Pick the khai type(s) the engine's nature fits. More than one may apply: use all
that make sense, the Playwright's call.

- **Over time** (an arc, a change that plays out) : anchor on a **play** or its
  **plots**.
- **Desired or intended but contested** : anchor on a **plan**.
- **An inner self** : anchor on a **persona**.
- **A structural role, a stance the room reads** : anchor on a **position**.
- **A mechanism, a thing that fires** : anchor on a **process**.
- **A charged object** : anchor on a **piece**.
- **An environment, a field** : anchor on a **place**.

A single engine often carries more than one: a stance that drifts over a run
anchors on a position and is read across the plots.

### Lock only what is certain

The guide is reasoning space and creative freedom, not a cage. **Lock a chapter
only where you are 100% certain.** The Roadie plumbing is the clear case, and it
is always locked. Everywhere else, explain the why and leave the placement to the
Playwright's judgment for the play in hand: a guide that dictates the exact link
for every case has stopped teaching the engine and started writing one play.

## Mode A: create an engine

1. **Settle the shape and the anchor.** Decide process (a thing that happens
   over time, anchored by a `process`) or position (a stance a persona holds,
   anchored by a `position`). Name the anchor: the one element that holds the
   whole.
2. **Author the anchor** from its canon template
   ([process](references/template_process.md) or [position](references/template_position.md)).
   State what the whole engine is and what moves in it.
3. **Author each member** from its template, one per stance, place, or piece the
   engine needs. As you write each one, add its link **up** to the anchor and
   add the anchor's link **down** to it.
4. **Tie the siblings across** while the connections are fresh: where two
   members meet in meaning, link them in a sentence that carries the relation.
5. **Write the manifest.** Declare `engine`, `tagline`, `type`, the members tree
   (or `anchor` + `expressions`), the `requires`, and the `card`. The anchor in
   the manifest must equal the anchor in the prose.
6. **Write the Playwright wiring guide** (`playwright_instructions.md`): the HACKS
   chapters explaining the engine's model and where it anchors, so a Playwright
   wires it from understanding. Required of every engine, and kept off tour.
7. **Add the boilerplate** (copied from an existing engine) and a changeset.
8. **Run the create self-check**, then hand to a runtime for the structural kit.

## Mode B: audit an engine

Produce a report, not a rewrite.

1. **Map it.** List every content file. Read the manifest; mark the anchor and
   the parent of each member.
2. **Score the four ties.** For each file, record what it links to and what
   links to it, then total three counts:
   - **anchor down** : links from the anchor to members.
   - **members up** : members linking the anchor.
   - **siblings across** : links between members that share a parent.
3. **Check the floor** (or note that a runtime must): exactly one anchor, the
   manifest well formed, no orphan file, and the Playwright wiring guide present.
4. **Return findings and a verdict.** Name the shape: **full** (all four ties
   hold, siblings woven, no orphan); **star with no web** (spokes hold, zero or
   thin siblings); **silent anchor** (members reach up, anchor names none of
   them); **has orphans** (one or more files off the weave); or **thin** (a
   two-file engine with no siblings to tie, which may be correct: ask whether it
   is finished). An engine can carry more than one shape at once (a silent anchor
   that is also a star with no web is common); name every shape that applies.
5. **Name the repair brief.** For each gap, list the exact ties to add. That list
   is what Mode C works from.

## Mode C: repair an engine

Repair touches prose, not structure (unless the anchor itself is wrong). Add the
missing ties and lift weak content; never rewrite the engine wholesale.

1. **Audit first** (Mode B) to get the repair brief.
2. **Tie the anchor down.** In the anchor's closing summary, name each member in
   a sentence that says what part it plays, and link it.
3. **Tie the siblings across.** In each member, find the one or two siblings it
   most naturally meets (its opposite, its neighbour, the state it becomes) and
   link them where their meanings touch.
4. **Improve while you are there.** A link is an excuse to sharpen the sentence
   it sits in: weak, generic prose is its own fault. Keep the content's claims;
   raise the writing.
5. **Re-audit.** Repeat until the verdict is full.

## How to write a link

A link earns its place by carrying meaning. Weave it into a sentence the reader
would want even without the link.

- **Bad (a bare list):** "See also: [innovator](position_innovator.md),
  [laggard](position_laggard.md)."
- **Good (woven prose):** "The stance a persona takes is read in the position
  they hold: as the [innovator](position_innovator.md) who carries the idea
  first, or the [laggard](position_laggard.md) who refuses it until refusing
  costs more than taking it."

The anchor's down-links live best in its closing summary, where it gathers the
whole engine in a sentence or two. A member's up-link lives best where it states
the larger thing it is part of. A sibling link lives best at the point of
contrast or handoff, where one member is defined against another.

## Self-checks

**The graph (audit and repair):**

```
- [ ] Exactly one anchor (one manifest root / one declared anchor)
- [ ] Anchor reaches down: the anchor links every member, in prose
- [ ] Members reach up: every member links the anchor, in prose
- [ ] Siblings reach across: every member links at least one sibling, in prose
- [ ] No orphan: every content file both links and is linked
- [ ] Links are woven into meaningful sentences, not bare lists
- [ ] The weave is connected: from any file you can reach any other
```

**Create (in addition):**

```
- [ ] Manifest declares engine, tagline, type, anchor (members tree or anchor + expressions)
- [ ] Manifest anchor equals the anchor named in the prose
- [ ] requires declares the wiring altitudes; card carries wire/issue/require/enforce/setup
- [ ] Every member file exists and matches its declared type
- [ ] playwright_instructions.md is present: HACKS chapters, the why not the placement
- [ ] A changeset is present
```

A tool-capable runtime counts the ties by scanning each file for in-bundle links
and grouping them anchor-down, member-up, sibling-across. Running without tools,
walk the files by hand and fill the checklist; do not assume a tie holds because
it should.

## Quality rules

- **One anchor, named once.** The anchor is the only root. Do not promote a
  member to a second hub.
- **Prose carries the link.** A link sits inside a sentence that means something.
  A "See also" block is a wiring failure, not a shortcut.
- **Audit reports; repair adds.** An audit returns findings, not edits. A repair
  changes links and the sentences around them, not the content the engine teaches.
- **Manifest and prose agree.** The anchor and members in the manifest are the
  anchor and members in the weave. If they disagree, the engine is broken.
- **House voice.** No em-dashes or en-dashes in any file. Use a colon, an ellipsis
  (...), parentheses, or a plain hyphen instead.

## Failure modes to watch for

- **The star with no web.** Every member points to the anchor and back, but no
  member points to a sibling. A list of variants, not a system. The most common
  flat engine: add the sibling ties.
- **The silent anchor.** Members point up, but the anchor names none of them, so
  a reader of the anchor cannot find the parts. Tie the anchor down.
- **The orphan file.** A content file that neither links nor is linked. Off the
  engine: tie it in or cut it.
- **The bare list.** Links dumped under a "See also" or "Related" heading. They
  exist but carry no meaning: rewrite them into the prose.
- **Manifest drift.** The manifest's anchor or members do not match the files on
  disk, or the prose treats a different file as the anchor. Reconcile before you
  wire.
- **The two-file engine.** An anchor and a single member: no siblings to tie. Not
  flat, but thin. It may be correct; ask whether the engine is finished.
