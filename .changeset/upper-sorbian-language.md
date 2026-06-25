---
"@chbrain/khai-language": patch
---

Register Upper Sorbian (`hsb`), the West Slavic regional language of Lusatia — it
gates clean (isolated; nearest sibling Polish ~0.8 back) because it is not German
at all. Documents the German-dialect finding: the High German dialects (Bavarian,
Swiss German/Alemannic, Kölsch, Palatine, Swabian) are the inverse of the
distinct-script case — too close to Standard German, so franc reads them as `deu`
and they stay exempt. Low German (`nds`) remains the one German dialect distinct
enough to gate; a dialect culture declares Standard German and the dialect via
`khai.languages`.
