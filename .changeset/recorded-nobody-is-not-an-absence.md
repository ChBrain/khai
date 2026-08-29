---
"@chbrain/khai-guard": patch
---

`exemptionClaim` no longer folds a recorded `owner: null` into an absent one.
The refusal was right either way; the guidance was not — an author who had
recorded that nobody qualifies was told to record an owner.
