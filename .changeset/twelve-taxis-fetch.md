---
"@chbrain/khai-engine-search-space": patch
---

Pack the Playwright guide. This engine's `files` named its content explicitly --
`index.mjs`, `README.md`, `REFERENCES.md`, `place_*.md`, `piece_*.md` -- and
nothing matched `playwright_instructions.md`, so the guide existed on disk and
was not in the tarball. It is now `["index.mjs", "*.md"]`, which is what the
other 359 engines and composites declare.

**The validator could not see it, and by construction cannot.**
`validateEnginePackage` requires the guide with `existsSync`, so it passed on
every run: the file is there. What ships is the tarball, and nothing in this
repository reads one. The instruction collector added in #1411 walks _installed_
packages, so for this engine it found no guide and always would have -- and the
comment in `instructions.mjs` asserting that `files: ["*.md"]` "already carries
it into the published tarball" is true of 359 packages and was false of this one,
asserted in prose and checked by nothing.

**It is the only instance, and that is computed rather than hoped.** Of 376
engines and composites, 359 declare `["index.mjs", "*.md"]`, 15 declare no
`files` at all and publish everything, and spine's list includes `*.md`; all of
those carry the guide by construction. No declared member anywhere in this
workspace lives in a subdirectory, so the other form of this fault -- a glob that
reaches only the package root while the content sits below it -- has no instance
here either.

Found by reading khai-cultures#438, which met this class twice in that house and
built a wall for it. The general check comes home to khai-tests separately; this
is the one live defect it found here, fixed first so that wall lands green.

The tarball goes from 28 files to 30: the guide, and the CHANGELOG the other 359
already ship.
