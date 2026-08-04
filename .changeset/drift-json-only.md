---
"@chbrain/khai-guard": patch
---

`khai-guard drift --json` now emits only JSON on stdout. The success line was printed after the report regardless of the flag, so the output could not be parsed by the scheduled caller it exists for.
