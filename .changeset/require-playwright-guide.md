---
"@chbrain/khai-tests": patch
---

Require the Playwright wiring guide on every engine. `validateEnginePackage` now
reports a finding when `playwright_instructions.md` is missing, the meta engine
included - the spine carries a short guide that points at the Roadie, so there is
no carve-out. The recognition (validate-when-present, exempt from manifest-member
and loose-file checks) was added earlier; this flips it from optional to
required, now that every engine carries one.
