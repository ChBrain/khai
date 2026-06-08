---
"@chbrain/khai-language": patch
---

validateLanguageOfFile now normalizes the configured nlpLanguages through the
same ISO map it uses for the resolved language, so an entry given as an ISO code
(e.g. "fr") matches the normalized resolved language ("french") and actually
routes to the NLP/LLM fallback. Previously the codes were only lowercased, so
"fr" could never match "french" and the local detector ran anyway — the
opposite of the intent of declaring the language NLP-handled.
