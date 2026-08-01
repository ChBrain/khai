---
"@chbrain/khai-tests": patch
---

The registry build heals the top CHANGELOG heading with the manifest (the single-writer rule covers all three files), and validate fails a heading above the registry version: a version that never shipped. Fixes the count-moving release drift (khai issue 1040).
