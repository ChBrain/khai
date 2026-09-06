---
"@chbrain/khai-arch": patch
---

check_play.mjs names the two dash characters as escapes in its own source, so the file passes the skill bundle's guard, which bans them raw in every file.
