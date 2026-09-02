---
"@chbrain/khai-tests": patch
---

khai-misfits carried a second generation of science-index checks that
`@chbrain/khai-tests` never owned: two walls on the index's own key
computation (a homonym form declared in a misleading order, an index key that
is a generational suffix rather than a person), the axis/opposition wall (a
unit's warrant may declare an `axis`/`sign` in frontmatter, and two units on
one axis with opposite signs must each name the other), and three probes
(undeclared namesakes, the mixed-cell reading list that is their complement,
and a hidden compound work behind a semicolon in a Key Work cell). All of it
was kit-shape-agnostic in the house's own reading, just never lifted.

It is lifted now, as `src/science-walls.mjs`, exported from the kit's public
entry point and wired into the `science` CLI as `forms`, `suffixes`,
`opposed`, and `probe`. Two of the three lifted walls turn out to be reading
this build's OWN keying rather than the older first-match, suffix-keeping
build the house's account of them describes: this build already resolves a
homonym by longest match and already strips a trailing suffix before taking a
surname, so `forms` and `suffixes` catch a misleading declaration order and a
genuinely person-less Source cell, never a citation the build actually
mis-keys. Measured against khai-misfits, khai-cultures, and this repository's
own tree (a homonym house, a house with no Origin tables at all, and an
engine monorepo) before shipping, per this kit's own case law on measuring a
wall against every house it will judge.
