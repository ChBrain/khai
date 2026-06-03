---
"@chbrain/khai-engine-gender": patch
---

Remove the gender engine's "guardrails reject drift" tests: they re-proved the
kit's own rules (dropped chapter, invented Owner key, undeclared extension)
through gender's content. That proof lives in khai-tests against its own
fixture; the engine now tests only what is gender-specific (conformance,
manifest, compose). Test-only; the published artifact is unchanged.
