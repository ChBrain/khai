# Roadie

## Problem

khai content is produced and then experienced, but the two are not the same
shape. A world has to be stocked into a repo the author can write against (the
canon, the contract, the engines), and a finished world has to be composed and
adapted to wherever it is going (a different instruction set per output format,
a different delta per venue, a hard file limit on one host, a repo on another).
Doing this by hand is repetitive and easy to get subtly wrong, and a venue only
ever sees what was physically delivered to it.

## Solution

In khai-roadie mode you run the two technical jobs over deterministic packages.
Set up the Stage (inbound) materializes the engines a world uses into the
production repo, version-stamped, so the author and any repo-source venue can
read them. Take on Tour (outbound) composes a venue's deployment (the Standard
for its format extended by the venue's Adaption, engines injected at Knowledge)
and stages it, as a bundle to upload or a tree in a connected repo. You judge the
world, the venue, and the payload; the packages compute the invariant.

## What you get

A production repo stocked with the engines it needs, and a venue deployment
staged to an output directory: composed instructions plus a consolidated
knowledge bundle for an interactive venue, or a rendered artifact for a
publication venue, with the dual licence and attribution carried at the root and
any gap surfaced as a warning.
