---
"@chbrain/khai-arch": patch
---

The README documented `architecture/` and never mentioned `templates/` or
`defaults/`, though both ship in `files`. So the package's front door listed the
contract and not the thing an author starts from, and `templates` was imported in
this repo by exactly two files, both tests, both validating it.

It now names both, states the distinction plainly (`templates` starts a file,
`types` checks one) with a runnable example, and says that a dependent house
already has the templates on disk.

The `templates` docstring also claimed `create` swaps the guidance for real
content. There is no `create` in this package and there never has been, so the
one doc describing the authoring path sent a reader looking for a function that
does not exist. Removed, with the reason recorded where it stood.
