---
"@chbrain/khai-stage": patch
---

Fix Windows path separator handling in blueprint stamper. The housePath() function normalizes paths before checking for dotfile patterns (github/ → .github/, husky/ → .husky/). On Windows, path.relative() returns backslashes which failed the startsWith() check.
