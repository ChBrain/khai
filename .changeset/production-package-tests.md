---
---

Cover the production layer: fourteen tests over `validateProductionPackage`,
dormant until the source lands.

Three groups. The manifest contract, including that `PRODUCTION_CLASS` is
literally `"house"` -- the class khai-arch already gives play and plot -- so a
later change that quietly swaps it for a new word fails here rather than
silently extending the canon's vocabulary. The publish invariant, and its one
test worth reading: the `../` neighbour is **created** so the ordinary
broken-link check passes, and the invariant must still fire; without that setup
the test would pass for the wrong reason and prove nothing. And the workspace
case, built on a real symlink into a hoisted `node_modules`, because that is the
shape that made the two notions of "installed" disagree.
