---
---

`packing.mjs`: what a package promises, held against what it ships.

A manifest names content, `files` decides what reaches the tarball, and nothing
held the two to each other. khai-cultures met the class twice -- a tongues
package whose `files: ["*.md"]` reached only the package root while all sixty
varieties lived below it, shipping 5 files of 65 with every one of its 236
inbound links 404ing, and a house that shipped a registry describing nineteen
groups and not one group file. khai met it once, in the quietest available form:
`validateEnginePackage` requires a Playwright guide and asks `existsSync`, so an
engine whose `files` named its content explicitly and matched no
`playwright_instructions.md` passed every run with the guide on disk and absent
from the tarball.

Three different mistakes, one failure, and none visible in a diff, because a diff
shows the working tree and what ships is the box.

**The box is asked of npm and never computed.** A second implementation of the
packing rules is a second thing to get wrong, and it would have agreed with all
three bugs -- which is not hypothetical: `publishesContent` reads `files` through
a three-literal heuristic and was wrong about that very engine.

**One invocation, not one per package.** `npm pack --dry-run --json --workspaces`
answers for the whole workspace in about the time a single package costs: 388
packages in roughly eight seconds against a second each. That is the difference
between a corpus-wide wall and a sampling scheme that has to reason about which
packages are alike, which is packing semantics again by another name.

Two deliberate narrownesses. The guide is required only where it is **already on
disk**, because whether a package OWES one is `validateEnginePackage`'s question
and stays there; two gates answering one question is how they come to disagree.
And a package npm did not report gets **no verdict**, since an absent name was
not asked about rather than proven hollow.

Run against this workspace it returns exactly one finding, and it is the one
found by hand: search-space, fixed separately, which must land first or this
one's own CI is red.

`publishesContent` is left alone here. With search-space's `files` corrected it
is no longer WRONG, only a re-implementation with no caller, so retiring it is
cleanup rather than a fix and owes its own test-and-source pair.
