---
---

Cover the Playwright instruction collector: thirteen tests, dormant until the
source lands, plus a forward-compatible fixture change.

The collector tests hold the two claims the design rests on. **The closure is
declared, not scanned** -- a hoisted workspace holds every package's dependencies
in one directory, so a scan would hand a root a stranger's instructions, and
there is a test with a stranger installed beside the root that must not appear.
**The order is depth** -- deep before shallow, so an engine's primitives are read
before the content package that fills them, computed rather than hand-ordered.

The two layers are covered both ways: no chapters by default (five chapters times
a large closure is a context bomb), chapters for a named package, chapters for
all, and a law read only when asked. One test holds a distinction that cost a
debug cycle to find: **"exports no law" and "could not be read" are different
facts**, and the first draft collapsed them, reporting no law for every package
that had one.

The dormancy guard is the module's existence rather than a string probe, because
a static import of a module that is not on main fails the whole file at load.

`production-package.test.mjs` gains a Playwright guide in its fixture. This is
forward-compatible on purpose: green on today's main, and green once the
production contract requires the guide. Tests only; ships no package content.
