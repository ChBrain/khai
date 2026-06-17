---
"@chbrain/khai-skills": patch
---

theatre-manager: a play addition takes no changeset. The build (`khai-tests registry build`) is the single writer of the version — it sets `0.<count>.0`, and `changeset publish` ships it. Changesets are reserved for non-play patches. This removes the `0.<count>.1` double-bump drift (a patch changeset re-bumping the patch on top of the minor the build already moved).
