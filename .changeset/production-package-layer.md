---
"@chbrain/khai-tests": patch
---

Open the production layer: validate a package that ships one khai play.

`validateProductionPackage` is the third package validator, beside the engine
and the composite. A production carries no WIRES card, no generated README, no
members tree and no `compose()`, so it gets none of those checks; it declares
`khai.class: "house"` -- the canon's own class for the types that make a play,
not a new word -- and is routed on that, the same way the spine engine is routed
on `meta`. It checks the manifest (class, id, no `khai.engine`, one anchoring
play), the publish invariant (no `../` in any shipped markdown), and then hands
the content to the ordinary consumer validator.

The publish invariant is not redundant with the broken-link check, which is why
it exists: a culture sitting beside its siblings in a working tree resolves
`../france/position_language_fr_fr.md` perfectly, so the link check passes and
the published tarball is broken. Only the invariant can see that the neighbour
is not in the package.

`installedEngineManifests` now also resolves the engines the root's own
package.json declares, walking up through node_modules, instead of only scanning
the directory beside the root. A workspace hoists installs to the workspace root,
so a package validated on its own directory had no local node_modules, its
engines' wiring laws were invisible, and every wiring link read as broken -- while
package-specifier links, which already walked up, resolved. The two notions of
"installed" disagreed and neither root gave a true reading. The declared walk is
unioned with the flat scan rather than replacing it, so engines arriving
transitively through a composite are still seen.
