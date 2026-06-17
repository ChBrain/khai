---
"@chbrain/khai-stage": patch
---

Add `language: english` to the blueprint management core files. A non-English
house's language gate requires every management file to declare its language;
the houses already carried `language: english`, but the chain-owned blueprint
core omitted it, so converging a non-English house (e.g. Grimm `de`) to the
blueprint stripped the field and broke the house gate. Surfaced by the management
convergence gate (Order 0b).
