---
---

Pin three surfaces of `packages/khai-tests/src/gates.mjs` that PR #1447 shipped
but that `tests/gates.test.mjs` never covered: the optional per-gate `count`
regex, the `onRecord` progress callback on `runGates`, and the exported
`gateLine` formatter that `renderGates` itself is built on. All three existed
only as PR-body prose, which is the exact drift conduct.md's law 6 names:
"anything you decide that the spec did not already specify goes into the
repo, not only into the pull request description," because "a decision that
lives in a PR body gets re-argued by the next person." A live test suite is
the strongest form the repo half of that can take.

Six tests added: `count` extracts the tool's own words verbatim from a
passing wall's output; a declared `count` that matches nothing on a passing
wall says "count not found in the output" rather than going blank;
`onRecord` fires once per record, in order, with the same objects (including
the visibility record) that land in `results`; firing it changes nothing
about the outcome; `renderGates` prints, for every record, exactly
`gateLine(record)` as its line, so a live ticker and the paste block can
never show two different sentences for one record; and `gateLine` is pure
and total across ok, not-ok, and detail/fix/error combinations. Tests only;
`src/gates.mjs` is unchanged, per the source/tests split.
