---
"@chbrain/khai-tests": patch
---

`referencedIds` resolved a relative link target and nothing else, so a group
whose members had migrated into their own packages derived the empty set from
casts that were still plainly there in its anchor. It did not fail — it omitted
the field because it was empty, and the house published a group referencing
nothing.

The rule moves to `src/links.mjs` (`linkTarget`, `castIds`) and reads both
shapes: a relative path across one tarball, and a package specifier through npm.
It is a module rather than an inline helper because a consumer reading the
published house needs the identical rule, and two implementations of "what does
this link point at" diverge.

Measured against khai-cultures 0.316.0, five of nineteen groups were wrong, not
one: `anglosphere` missing `united_kingdom`, `eu` missing `austria` and
`germany`, `francophonie` missing `switzerland`, `nato` missing `germany` and
`united_kingdom`, and `dach` missing all three of its members. Only `dach` was
noticed, because only `dach` went to zero.

Two guards ride with it. A referencing entry that derives no references is now a
build error rather than an omitted field. And `validateProductionPackage`
requires a production that declares `exports` to export `./package.json` — every
consumer finds a production by resolving that subpath and every sibling casts
its content by subpath, both of which work today only because no production
declares `exports` at all.

`buildRegistry` / `computeRegistry` take an optional `packageIds` map (npm name
→ unit id); a house that has migrated nothing needs none and is unaffected.

The build also stamps `source` on every registry entry — `{ package, path }`,
the npm package that ships the unit and the path below its root — so a reader
outside the repository never infers a location from the absence of a marker.
`validateCollectionRegistry` shape-checks it when present, on the same phase-in
the `kind` discriminator took: a registry built before the field existed still
verifies until it is rebuilt. The strictness lives in the reader instead, and
deliberately.

The link rule now lives in the new `@chbrain/khai-foyer`, which this package
depends on. The direction is the point: the reader must stay free of the
validator toolchain, so the kit reaches down to it and never the reverse.
