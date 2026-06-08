---
"@chbrain/khai-guard": patch
---

license-check no longer aborts the whole scan on one unreadable file. A single
file matched by the policy glob that failed to read or JSON-parse called
process.exit(2) mid-loop, masking the license verdict on every other package.
Such a file is now recorded as a violation (its license cannot be confirmed) so
the scan completes and exits 1 with the offending path named, while a genuine
environment failure (git ls-files) still exits 2.
