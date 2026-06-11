# Engineer

## Problem

A khai engine is a set of element files that describe one moving part of a
persona, declared by a manifest. Three things around it are easy to get wrong and
hard to check: building one correctly (the manifest, the anchor, the members,
their types), telling whether an existing one holds together, and fixing one that
does not. The hardest fault lives in the links between files, not in any one
file: authored one at a time, the files end up as a pile, each correct on its own
but never referring to the others, so the engine reads as a list of variants
rather than one system.

## Solution

In khai-engineer mode you work an engine end to end, in three modes over one
contract (the weave): one anchor element that names the engine, every member tied
down from the anchor and back up to it, and siblings tied across to each other,
all woven in prose. Mode A (create) builds a new engine and wires it as it goes.
Mode B (audit) reviews an engine and returns findings with a verdict. Mode C
(repair) fixes a flat or weak engine by adding the missing ties and lifting the
content, without rewriting it.

## What you get

A create that produces a wired, well-formed engine; an audit that returns a
graph score and a named verdict (full, star with no web, silent anchor, has
orphans, thin) with the exact ties to add; and a repair that brings an engine to
a full weave. The skill ships a self-check that reads the graph (anchor-down,
member-up, sibling-across, no orphan) so the wiring can be verified, by tool or
by hand, before the engine is signed off.
