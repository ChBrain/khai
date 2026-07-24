---
"@chbrain/khai-stage": patch
---

Stamp a `format:check`-green house by construction: format the generated markdown. `khai-stage` fills the source name into aligned markdown tables in `REFERENCES.md`, so substitution changes the cell widths (a short source like `L2` narrows a column padded for the `{{SOURCE_TITLE}}` token) and prettier reflows the stamped baseline, turning the house's very first `format:check` red before a play is written. The generator now runs its stamped markdown through prettier using the house's own `.prettierrc`, so the output is clean for any source and nothing is exempted from the gate: the reference warrant stays under `format:check` for the operator's later edits. Scoped to markdown, the only surface substitution can dirty. `stageHouse` is now async (prettier's format is async); its two callers await it.
