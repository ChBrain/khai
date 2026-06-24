---
"@chbrain/khai-language": patch
---

Register Tetum (`tet` → `tet`) so Timor-Leste gates instead of riding the exempt
path. franc tops `tet` cleanly on every sample (its only near sibling is `tdt`,
Tetum's own Dili-variety code; the heavy Portuguese loanwords don't pull it to
`por`). It is Latin-script and spaced, so no scriptio-continua handling is needed.
A culture currently listing `tet` in `khai.languages` should drop it to take the
gate (the NLP-fallback check precedes detection).
