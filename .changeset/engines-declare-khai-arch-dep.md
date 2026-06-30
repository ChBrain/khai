---
"@chbrain/khai-engine-deception": patch
"@chbrain/khai-engine-gift": patch
"@chbrain/khai-engine-implementation-intention": patch
"@chbrain/khai-engine-negotiation": patch
"@chbrain/khai-engine-persuasion": patch
"@chbrain/khai-engine-recognition": patch
"@chbrain/khai-engine-reversal": patch
"@chbrain/khai-engine-ritual": patch
---

Declare the `@chbrain/khai-arch` runtime dependency that `index.mjs` imports (`compositionOrder`). It was previously resolved only via workspace hoisting, so a standalone install of these engines failed to load. Also declares the `@chbrain/khai-tests` devDependency used by the test suite and aligns vitest to the repo-standard `^4.1.9`.
