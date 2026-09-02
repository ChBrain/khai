---
"@chbrain/khai-tests": patch
---

khai-cultures carries its own hand-rolled resolver, `tests/culture_sources.mjs`,
because a culture's home has already moved twice and a stale path once made a
whole ratchet read "no culture touched" for weeks. Measuring this kit's
`house.mjs` against the case that resolver's own comments document, as a house
weighs replacing its hand-rolled reader with the kit's, found two gaps.

`unitsOf` counted every content-dir subdirectory as a unit regardless of what
it held. A migration's `git mv` moves a unit's anchor file into its own
production package but can leave the directory it came from on disk, empty,
since git tracks no empty directories and the filesystem does; that leftover
then collided with the production the real unit moved to and threw a false
"two places at once". khai-cultures's own resolver carries the identical
unconditional throw and would hit the same false duplicate. A content-dir
directory now counts as a unit only when it holds the collection's own anchor
file; a directory with none is ignored at the unit level and reported, on
request, by the new `emptyUnitDirs(house)`. Two places that both carry an
anchor still throw: that is a genuine duplicate, not debris.

`touchedUnits` classified a whole unit as authored the moment any one of its
files changed for real, which answers a wall that reads the whole unit and not
one that reads only some of its files. khai-cultures's own resolver already
carries the finer answer: `authoredCultures` returns the changed paths that
were actually authored, per culture, because its own ratchets read only plot
or play files and a walk-wide relink retargeting a link inside an unrelated
file must not charge the file a person never opened. `touchedUnits` had no
equivalent. Each entry in `files` now carries its own `authored`, and the new
`authoredFiles(house, { base, head })` returns the file paths a diff range
actually authored, per unit, for a gate that wants to charge the file rather
than the unit it happens to share a directory with.

Measured against khai and khai-misfits before and after both changes:
`unitsOf`'s unit counts did not move on either house, and every existing field
`touchedUnits` returns is unchanged.
