---
"@chbrain/khai-guard": patch
---

changeset-check: require a `minor` changeset on a content add (was: forbid one).
A count-driven house now steers every deploy through the "Version Packages" PR,
so a content add must carry a changeset — and it must be `minor`, because the
version reconcile clamps the minor to the count and resets the patch. A `patch`
or empty changeset on a content add survives the reconcile (count === minor
after the count build) and drifts the version to `0.<count>.1`; the gate now
rejects it with that explanation. Non-content rules are unchanged (ships `files`
→ patch; ships nothing → empty).

Note for the maintainer: this tightens the gate's behaviour for every consuming
house, so it may warrant escalating to a `minor` release via the `bump:minor`
label rather than shipping as patch.
