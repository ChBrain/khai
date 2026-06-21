---
"@chbrain/khai-language": patch
---

detector: extend franc routing to the cluster languages the margin protects

Adds `bg` Bulgarian, `sr` Serbian, `tr` Turkish and `uz` Uzbek to `FRANC_MAP`.
franc's _top_ guess for these is often a sibling (Serbian reads as Bosnian,
Bulgarian as Macedonian, Turkish as Azeri), but the declared language stays within
the gate's 0.1 confidence margin, so correct prose still passes and only a gross
mismatch is flagged. It is a weaker, gross-error-catch gate for these — it will not
split Serbian from Bosnian — but gating is preferred over dropping them to NLP.

Only Czech (`ces` falls to 0.77 behind Croatian) and Azeri (the `azj`/`azb` split)
genuinely false-fail, so they remain exempt (`khai.languages`). The "unregistered"
test now uses Czech. A verified sample per added language keeps the routing pinned.
