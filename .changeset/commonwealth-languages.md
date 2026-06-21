---
"@chbrain/khai-language": patch
---

Add Commonwealth language coverage to the franc tier: Tamil, Telugu, Gujarati,
Punjabi, Sinhala, Igbo, Afrikaans, Zulu, Xhosa, Malay, Maori, Fijian, Samoan,
and Tongan. Each gates on its own native prose (verified one sample per language
in the franc-routes test); the Nguni pair (Zulu/Xhosa) sits within the 0.1
margin and gates at the gross-error grade, and Malay routes to franc's `zlm`.
