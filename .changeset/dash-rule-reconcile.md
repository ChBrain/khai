---
"@chbrain/khai-tests": patch
---

Encoding rule: the sanctioned dash is the spaced hyphen ` - `, never `--`.
`checkEncoding` already rejected en/em-dashes but pointed authors at `--`,
which markdown renders back into an en-dash (the disguised dash). The guidance
now reads `use ' - '`, matching the canon's own encoding rule. (khai-arch's
encoding test is tightened in the same change to forbid the en-dash character
too, not only the em-dash.)
