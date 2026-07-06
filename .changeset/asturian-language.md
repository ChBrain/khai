---
"@chbrain/khai-language": patch
---

Register Asturian (`ast`) in the franc detection tier, extending the Iberian
set past Spain's three statutory co-officials.

Confirmed by the repo-standard multi-sample pass: own prose tops clean on 4 of 5
registers, and on the fifth Occitan edges the top while `ast` stays within 0.045
(inside the 0.1 margin), so it never false-fails. Gross-error catch is firm
against Catalan/Galician/English and borderline against Castilian (gap ~0.10) —
the same Ibero-Romance limit as `gl`. Overturns the earlier "held" verdict (a
Catalan sibling score within margin on one sample never cost `ast` the top).
Documented in `LANGUAGES.md`.
