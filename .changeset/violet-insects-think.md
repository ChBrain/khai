---
"@chbrain/khai-composite-depression": patch
---

Make the package load, and qualify its links. The entry point imported a
`buildCompositeLoader` that @chbrain/khai-arch does not export, so importing the
composite threw; and the cross-atom links were repo-relative, which resolves in
this workspace and leaves the tarball for anyone who installs it.
