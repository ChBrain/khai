---
"@chbrain/khai-tests": patch
---

Add the **engine kind** of the serve engine: `packEngine(dir)` and a
`khai-tests pack <engine-dir>` command package a khai content engine as a
portable zip via `@chbrain/khai-pack`, in the cultures layout (generated README,
authored REFERENCES, rendered WIRES card, and a license note at the root; the
member files flat under `engine/`; no package.json, index.mjs, or tests). The
engine is packaged **through its validator** — a non-conforming engine is never
shipped.
