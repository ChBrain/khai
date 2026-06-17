---
"@chbrain/khai-tests": patch
---

Add the management convergence gate (Order 0b). `khai-tests management build`
snapshots the shared management core from the khai-stage blueprint into the
package (the single writer); `khai-tests management check [dir]` holds a house's
management to that snapshot, allowing only overlay differences (cast personas,
house plans, orders/). The Roadie/touring module is deferred (not in the core
yet). No new runtime dependency; the snapshot ships in the package.
