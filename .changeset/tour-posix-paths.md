---
"@chbrain/khai-tour": patch
---

findFiles returns POSIX-separated paths, so a bundle's section order no longer
depends on the operating system that built it.
