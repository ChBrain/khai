---
"@chbrain/khai-language": patch
---

Promote Czech from exempt to a gating language. Re-examining the "exempt"
verdict under the 0.1 margin showed Czech was simply on the wrong engine: franc
occasionally misreads it outright (one sample read as French), but languagedetect
only ever confuses it with its Slovak sibling — always within the margin. Routed
through languagedetect (`cs` → `czech` in `ISO_MAP`), Czech now gates at the
tight-cluster grade (gross-error catch only, won't split Czech from Slovak),
verified across 8 samples plus English/German gross-mismatch flags. This closes
NATO: all 32 members' official languages now gate locally.
