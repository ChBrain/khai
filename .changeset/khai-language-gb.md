---
"@chbrain/khai-language": patch
---

detector: add the UK languages — Scottish Gaelic, Irish, Scots

Routes `gd` Scottish Gaelic (clean), `ga` Irish and `sco` Scots through franc.
Irish sits in the Goidelic cluster (franc's top may be Scottish Gaelic) and Scots
is English-adjacent (top may be English), so both gate at the gross-error grade —
within the 0.1 margin, correct prose passes and only a gross mismatch is flagged.

With English and Welsh already gated, this covers the UK's text languages except
**Cornish** (`kw`), which franc does not model (it reads as Breton); Cornish stays
exempt via `khai.languages`. A verified sample per added language pins the routing.
