---
"@chbrain/khai-guard": minor
---

Make the exemption list a ratchet in both directions: `homonymGrowth` refuses an
entry that appears without a recorded grant (the list may shrink freely), and
`touchedExemptions` names the stem to take when a diff is already standing in an
engine that still holds a live one. `memberPolicy.homonyms` now accepts a map of
`stem -> { proposed, granted }` as well as the flat array, both normalized
through `exemptionStems`. Advisory where a rename is breaking; enforced only
against growth.
