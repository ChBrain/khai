# Engineer

## Problem

A khai engine is a set of element files that describe one moving part of a
persona. Authored one file at a time, they easily end up as a pile: each file
correct on its own, but never referring to the others. A reader cannot travel
from one part to the next, and the engine reads as a list of variants rather than
one system. Spotting and fixing this by hand is easy to get wrong and hard to
check, because the fault is in the links between files, not in any one file.

## Solution

In khai-engineer mode you wire an engine into one connected whole. The skill
holds a single contract (the weave): one anchor element that names the engine,
every member tied down from the anchor and back up to it, and siblings tied
across to each other, all woven in prose rather than dumped as a list. Mode A
wires a new engine as it is built; Mode B repairs a flat engine by adding only
the missing ties, touching prose and never the content.

## What you get

An engine whose files form a connected graph: from any file a reader can reach
any other along links carried in meaningful sentences. The skill ships a
self-check that reads the graph (anchor-down, member-up, sibling-across, no
orphan) so the wiring can be verified, by tool or by hand, before the engine is
signed off.
