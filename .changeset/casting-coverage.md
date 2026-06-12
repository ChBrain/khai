---
"@chbrain/khai-tests": patch
---

Add casting-coverage validation to `validateProject`. A plot must cast at least
one element of its play's Company (links it inline); a plot that names the
company only in plain prose is now an error, the dual of the position→persona
cast check at the play level. A Company element no plot casts is reported as a
warning, since the Company is the closed cast a play may field, not a mandate
that every member appear.
