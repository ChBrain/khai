---
"@chbrain/khai-language": patch
---

Register the Africa batch (12 languages) — the last frontier. Mostly clean:
`ti` Tigrinya, `om` Oromo (Horn); `sn` Shona, `st` Sesotho, `lg` Luganda, `ln`
Lingala (Bantu); `yo` Yoruba, `wo` Wolof (West Africa); `mg` Malagasy (island).
Tight-cluster grade: `rw` Kinyarwanda (Kirundi sibling), `bm` Bambara (Maninka),
`tw` Twi/Akan (Fante). Yoruba overturns the early world-probe's "fail" (bad
sample). `DENSE_SCRIPT_RE` gains Ethiopic for Tigrinya. Exempt (documented):
Amharic (false-fails to Tigrinya — the Ge'ez cluster is asymmetric), Chichewa
(1-in-4 false-fail to Swahili, like Papiamento), Kabyle (reads as Tamazight `tzm`).
