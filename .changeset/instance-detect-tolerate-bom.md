---
"@chbrain/khai-tests": patch
---

instance discovery now tolerates a leading UTF-8 BOM. Both instance probes (`instanceFiles`, `findInstanceFiles`) keyed on a `---` at byte 0, so a BOM-prefixed content file was not recognised as an instance and was skipped by the validator entirely -- shipping unvalidated while CI stayed green. The probes now allow an optional leading BOM, so such a file is discovered and then flagged by checkEncoding ("BOM present") instead of vanishing.
