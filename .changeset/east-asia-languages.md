---
"@chbrain/khai-language": patch
---

Register the East Asia / Southeast Asia distinct-script batch — `zh` Chinese,
`ja` Japanese, `ko` Korean, `th` Thai, `km` Khmer, `lo` Lao, `my` Burmese, `bo`
Tibetan — all of which franc tops cleanly at 1.0. Crucially, this also teaches the
span gate to measure scriptio-continua scripts (the spaceless ones) by character
count: `minSpanWords` counts whitespace tokens, so a whole Chinese/Thai/etc.
paragraph reads as one "word" and was being skipped — the language was registered
but never actually checked. A new `minSpanChars` fallback (default 24, via
`CONTINUOUS_SCRIPT_RE`) makes a paragraph qualify on enough words OR enough
continuous-script characters, so detection genuinely runs. Korean and Vietnamese
space their words and are unaffected.
