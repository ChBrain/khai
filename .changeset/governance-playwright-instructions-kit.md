---
"@chbrain/khai-tests": patch
---

Recognize `playwright_instructions.md` as a special engine file. Every engine may
ship a Playwright wiring guide (a `khai: instructions` HACKS file explaining the
engine's model). The kit exempts it from the manifest-member and loose-file
checks, and validates it as an instructions instance when present. It is
dev-steering, not engine content. (Making it _required_ is gated separately, once
every engine carries it.)
