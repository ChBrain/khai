---
"@chbrain/khai-rules": patch
---

checkLinks now resolves every relative link, not only ones already ending in `.md`. A link that drops the extension (`[x](pitch_kri)` where the file is `pitch_kri.md`) previously slipped through the broken-link gate; it is now flagged distinctly ("missing .md extension"), and any relative target that resolves to nothing is caught regardless of extension. External URI schemes (http, mailto, ...) and pure `#anchors` stay exempt.
