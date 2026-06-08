---
"@chbrain/khai-guard": patch
---

branchScope gains a third path class, `riders`. A rider (e.g. a management order
under `management/orders/**`) rides the lane of the change it accompanies — like
`shared` it is never an offender on any lane and `advise`/`branch` fold it into
that lane rather than splitting it off — but, unlike `shared`, it homes to a
declared `fallback` lane when it rides alone, so it is never stranded. This lets
an order and the change it drives (e.g. a play) land in one PR while an order
committed by itself still resolves to a home lane. Configured as
`{ pattern, fallback }`; `fallback` must name a declared lane. Backward
compatible: a config without `riders` behaves exactly as before.
