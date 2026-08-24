---
"@chbrain/khai-stage": patch
---

Stamp the lockfile sync into a house's version run, last in the chain. A house
released with its lockfile a version behind, because nothing rewrites it after
the version moves -- and in a house the version moves twice, since
`khai-tests registry build` sets it from the play count after `changeset version`
has already bumped it. The sync therefore runs after both, and a test pins that
order: placed between them it would record a number `registry build` replaces,
leaving the drift while looking fixed.
