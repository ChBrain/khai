---
"@chbrain/khai-language": patch
---

Register Venetian (`vec`) and Ligurian/Genoese (`lij`) in the franc detection
tier, completing the northern Italian regional set. Registry-only — no logic
change, no new dependency.

Each verified multi-sample: own prose tops clean (0 false-fails across 3
registers) and an Italian span is firmly flagged (`vec` gap ~0.33, `lij` ~0.23).
They are within-margin siblings of each other, so the gate won't split Venetian
from Ligurian (the Nguni `zu`/`xh` pattern) — but against Italian, the
contamination that matters, both are firm. Documented in `LANGUAGES.md`.
