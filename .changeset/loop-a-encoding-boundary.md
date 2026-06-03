---
"@chbrain/khai-arch": patch
---

khai-arch's encoding test pulls `checkEncoding` from `@chbrain/khai-rules`
instead of reimplementing it (BOM/em-dash/replacement-char constants and the
`assertEncodingOk` helper removed). No change to the canon content; the only
published delta is the added devDependency.
