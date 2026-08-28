---
---

Cover the packing wall: dormant tests. Nine cases for a `packing.mjs` that does
not exist yet; the source follows.

The class is a manifest naming content the tarball does not contain, and it is
invisible in a diff because a diff shows the working tree while what ships is the
box. khai-cultures met it twice; khai met it once, in the quietest available
form.

Three cases carry the design rather than the happy path:

- **one npm invocation for the whole workspace.** 376 engines and composites at
  about a second each is six minutes and would simply not be run, so the check
  would have had to sample and then reason about which packages are alike --
  which is reasoning about packing semantics, the thing this wall exists to stop
  doing. Batched it is one call, so the batching is pinned rather than assumed.
- **a guide is required only when it is already on disk.** Whether a package
  OWES one is `validateEnginePackage`'s question and stays there. Two gates
  answering one question is how they come to disagree.
- **a package npm did not report gets no verdict.** An absent name was not asked
  about -- a scoped ask, or a pack that failed -- and inventing one would fail
  every consumer that checks a subset.

The corpus case runs against this workspace itself. On today's `main` it finds
**one** package and it is the one found by hand: search-space's guide, fixed
separately, which must land before the source or the source's own CI is red.
