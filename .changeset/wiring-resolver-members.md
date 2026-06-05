---
"@chbrain/khai-tests": patch
---

requirementsFromEngine now reads an engine's normalized member tree, so the
wiring `link` is shape-agnostic: "anchor" resolves to the root member,
"expression" to the leaves, "any" to the whole tree. A members ladder (a process
root with channels and widths) now enforces its persona and Instructions wiring
the same way the anchor+expressions shorthand does.
