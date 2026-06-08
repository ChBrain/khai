---
"@chbrain/khai-tests": patch
---

The plan/order "pending target" check now matches only an actual unchecked
task-list item. It tested `line.includes("[ ]")`, so any Targets line that
merely mentioned `[ ]` in prose or a code span (e.g. "use an empty array
`[ ]`") was miscounted as a pending target and failed a complete plan/order.
It now anchors to a list marker: `^\s*[-*+]\s+\[ \]`.
