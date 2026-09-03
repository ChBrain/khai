// khai-foyer: read a published khai house from an installed dependency tree.
//
// The foyer is the part of a house the public is admitted to. A visitor reads
// what the house put out front -- its units, and the content each one holds --
// and never goes backstage, where the manifest, the licences, the coverage
// waivers and the changelog are the house's own business. That line is this
// package's one rule, and `ROLES` is where it is drawn.
//
// The producing half of the same question is `@chbrain/khai-tests`
// (`resolveHouse`, `unitsOf`): where a unit lives, asked from a worktree by the
// house itself. This is the consuming half, asked from outside the tarball. One
// vocabulary -- the registry entry's `source` -- and two vantages, which is why
// the link rule below is shared rather than written twice.

export { openHouse, ROLES, isContent } from "./src/foyer.mjs";
export { linkTarget, castIds } from "./src/links.mjs";
