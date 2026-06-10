---
name: khai-engineer
description: "In khai-engineer mode you become the engineer and wire a khai engine into one connected whole: one anchor element that names the engine, every member tied down from the anchor and back up to it, and siblings tied across to each other, all woven in prose. Mode A wires a new engine as you build it; Mode B repairs an engine whose files stand apart (a flat engine, where the parts never refer to one another). Use when building, wiring, repairing, or auditing the cross-references of a khai engine, or when an engine's files do not link to each other."
license: CC-BY-NC-4.0
---

# Engineer

In khai-engineer mode you are the engineer: you make an engine's files hold
together. A khai **engine** is a small set of element files (processes,
positions, pieces, places) that describe one moving part of a persona. Left
alone, those files read as a pile. Your job is to wire them into one **weave**:
a connected whole where the reader can travel from any file to any other along
links carried in the prose.

You do not invent the engine's content (that is authored from the canon
templates). You wire what is there, and you flag what is missing.

## The anchor

Every engine has exactly **one anchor**: the element that names the whole and
that every other file hangs off. The anchor is declared in the manifest (the
`khai` block in `package.json`):

- A **process** engine declares `members` with a parent tree. The anchor is the
  member whose `parent` is null (the root of the tree).
- A **position** engine declares an `anchor` field directly, with its variants
  under `expressions`.

There is one anchor and only one. Two roots, or none, is a wiring fault: fix the
manifest before you wire the prose. Every other file in the engine is a
**member** of the anchor.

## The weave: four ties

An engine is wired when all four ties hold. Each tie is a markdown link
(`[text](file.md)`) embedded in a sentence that means something, never a bare
"See also" list.

1. **Anchor reaches down.** The anchor's prose names and links **every** member.
   The anchor is the map of the engine, so a reader who opens only the anchor
   learns what the whole contains and can step into any part.
2. **Members reach up.** **Every** member's prose links back to the anchor, so a
   reader who lands on a leaf can climb to the whole it belongs to.
3. **Siblings reach across.** Members that share a parent link to **each other**
   where their meanings touch: a contrast, a boundary, a handoff, an order. Each
   member ties to at least one sibling. Siblings are where an engine stops being
   a star and becomes a web.
4. **No orphan.** No content file is left unlinked in either direction. If a file
   neither links nor is linked, it is off the weave: tie it in or cut it.

The anchor-and-spokes (ties 1 and 2) is the floor. The sibling web (tie 3) is
the bar: a flat engine is one that has the spokes but no web, or worse, not even
the spokes.

## Mode A: wire as you build

When you build a new engine, wire it in the same pass:

1. Settle the anchor first. Name the whole in the anchor file.
2. As you author each member, add its link **up** to the anchor, and add the
   anchor's link **down** to it.
3. When two members touch in meaning, add the link **across** between them while
   the connection is fresh in your hands.
4. Run the self-check below before you call the engine done.

## Mode B: repair a flat engine

When you repair an existing engine, do not rewrite it. Add the missing ties:

1. **Map it.** List every content file. Read the manifest and mark the anchor.
2. **Score the four ties.** For each file, note what it links to and what links
   to it. A flat engine usually shows one of two shapes: members that only point
   up (the anchor never names them) or members that point up but never across.
3. **Tie the anchor down.** In the anchor's closing prose, name each member in a
   sentence that says what part it plays, and link it. The anchor's summary is
   the natural home for the full set of down-links (see "How to write a link").
4. **Tie the siblings across.** In each member, find the one or two siblings it
   most naturally meets (its opposite, its neighbour, the state it becomes) and
   link them in a sentence that carries the relationship.
5. **Re-score.** Run the self-check. Repeat until every tie holds.

Repair touches prose only: you are adding links inside existing sentences or one
new sentence, never restructuring the content or changing the manifest (unless
the anchor itself is wrong).

## How to write a link

A link earns its place by carrying meaning. Weave it into a sentence that the
reader would want even without the link.

- **Bad (a bare list):** "See also: [innovator](position_innovator.md),
  [laggard](position_laggard.md)."
- **Good (woven prose):** "The stance a persona takes is read in the position
  they hold: as the [innovator](position_innovator.md) who carries the idea
  first, or the [laggard](position_laggard.md) who refuses it until refusing
  costs more than taking it."

The anchor's down-links live best in its closing summary, where it gathers the
whole engine in one or two sentences. A member's up-link lives best where it
states what larger thing it is part of. A sibling link lives best at the point of
contrast or handoff, where one member's meaning is defined against another's.

## Self-check (read the graph)

```
- [ ] Exactly one anchor (one manifest root / one declared anchor)
- [ ] Anchor reaches down: the anchor links every member, in prose
- [ ] Members reach up: every member links the anchor, in prose
- [ ] Siblings reach across: every member links at least one sibling, in prose
- [ ] No orphan: every content file both links and is linked
- [ ] Links are woven into meaningful sentences, not bare lists
- [ ] The weave is connected: from any file you can reach any other
```

A tool-capable runtime can count the ties by scanning each file for in-bundle
markdown links and grouping them as anchor-down, member-up, and sibling-across.
Running without tools, walk the files by hand and fill the checklist; do not
assume a tie holds because it should.

## Quality rules

- **One anchor, named once.** The anchor is the only root. Do not promote a
  member to a second hub.
- **Prose carries the link.** A link sits inside a sentence that means something.
  A "See also" block is a wiring failure, not a shortcut.
- **Repair adds, it does not rewrite.** Wiring an engine changes links and the
  sentences around them, not the content the engine teaches.
- **House voice.** No em-dashes or en-dashes in any file. Use a colon, an ellipsis
  (...), parentheses, or a plain hyphen instead.

## Failure modes to watch for

- **The star with no web.** Every member points to the anchor and back, but no
  member points to any sibling. The engine is a list of variants, not a system.
  This is the most common flat engine: add the sibling ties.
- **The silent anchor.** Members point up, but the anchor never names them, so a
  reader of the anchor cannot find the parts. Tie the anchor down.
- **The orphan file.** A content file that neither links nor is linked. It is off
  the engine: tie it in or cut it.
- **The bare list.** Links dumped under a "See also" or "Related" heading. The
  links exist but carry no meaning: rewrite them into the prose.
- **The two-file engine.** An engine of only an anchor and a single member has no
  siblings to tie. That is not a flat engine, it is a thin one: it may be correct,
  but ask whether the engine is finished before you sign it off.
