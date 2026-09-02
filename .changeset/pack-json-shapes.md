---
"@chbrain/khai-tests": patch
---

`npm pack --dry-run --json` prints an array of package records on npm 10 and
11 and an object keyed by package name on npm 12.0.2, and `packing.mjs` parsed
only the array shape in both places it reads pack output. On npm 12 that read
zero records and every packing check passed silently, having proven nothing.

`packRecords(raw)` now parses the JSON once, returns the records as an array
whichever shape the top level took, and throws naming the shape when it is
neither an array nor an object or when it holds zero records: a pack that
reports nothing is a finding, never an empty pass.
