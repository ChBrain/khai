---
"@chbrain/khai-rules": patch
---

Two small rule-atom hardenings: checkClauseDash now also flags a clause dash
written with tabs around the hyphen (`a \t-\t b`), not only ASCII spaces, so the
house-voice gate no longer misses that variant; and checkH1 escapes the type
before interpolating it into a RegExp (defensive -- canon type ids are plain
slugs today, but an unescaped value is a latent footgun).
