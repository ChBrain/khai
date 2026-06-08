---
"@chbrain/khai-language": patch
---

cleanProse now strips a line-start `*` or `+` list marker as a marker (with its
trailing space), not one character at a time. The alternation tried the inline
char class before the bullet branch, so only `-` bullets were fully stripped;
`*`/`+` left a stray space. Reordered so the bullet branch matches first. Affects
only the text fed to language detection, so detection results are unchanged.
