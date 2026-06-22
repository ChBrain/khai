---
"@chbrain/khai-language": patch
---

Register Bosnian (`bs` → `bos`) so cultures can declare `language: bs` instead of
staging Bosnian content as Croatian or Serbian. Bosnian routes via franc
(languagedetect has no Bosnian) at the tight-cluster grade: franc treats `bos` as
the Serbo-Croatian attractor, so Bosnian prose tops `bos` on roughly half its
samples and stays within the 0.1 margin on the rest — its own prose passes, a
gross mismatch is flagged. This completes the cluster: Croatian, Serbian,
Montenegrin, and Bosnian all gate.
