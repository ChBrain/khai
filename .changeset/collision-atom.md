---
"@chbrain/khai-rules": patch
"@chbrain/khai-tests": patch
---

Wall (order 1, collision): add the `titleCollisions` atom to khai-rules and gate it in the conformance kit. Within one scope (an engine's members, a play's cast) no two elements of different kinds may share a display title (the H1 name), and a whole-phenomenon piece may not reuse the play title; a bare title must name one element. Same-kind repetition is not flagged (two personas is the norm). The Playwright wiring guide is exempt (dev-steering named after the phenomenon, not a cast element) and a meta engine (the spine, not a cast) is exempt, mirroring how both are already exempt from the loose, orphan, card, and README checks. Verified green across all current engines, composites, and fixtures; no whitelist needed. Set at patch as the free level; a new gate may warrant a minor at the maintainer's `bump:minor` label.
