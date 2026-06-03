---
"@chbrain/khai-engine-gender": patch
---

fix(gender): republish at 0.1.2 to escape a poisoned 0.1.1. The 0.1.1 on the registry is a stale publish from an old checkout (it depends on `khai-arch ^0.0.3`, which predates the WIRES `card`), so any consumer that resolves 0.1.1 gets a manifest with no `card` and fails `engineCard` at build. `main` already carries the correct source — `card`, `khai-arch ^0.1.0`, and the Taxonomy/Restrictions fixes — so this bumps past the poisoned version to ship it cleanly.
