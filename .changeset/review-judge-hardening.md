---
"@chbrain/khai-review": patch
---

Two small judge-path hardenings. parseVerdict now extracts the first balanced
top-level JSON object (string-aware) instead of slicing indexOf("{") to
lastIndexOf("}"), so a model reply with trailing prose or a brace inside a
quoted value is parsed correctly rather than degrading to pass. mockJudge
decides padding from whether the filler strip changed the text, avoiding a
stateful `/g`.test() (it was already correct since the regex is function-local;
this just removes the footgun).
