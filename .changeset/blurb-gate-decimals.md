---
"@chbrain/khai-tests": patch
---

The playhouse registry blurb gate no longer false-fails a valid one-sentence
description. It counted every "." and rejected anything with more than one, so a
blurb carrying a decimal ("v1.5"), a file name ("Node.js"), or a lowercase
abbreviation ("e.g.") was wrongly flagged as multiple sentences. It now detects
a real sentence boundary (a terminator followed by whitespace and a new
capitalized word) instead. A lone underscore is also no longer treated as
markdown, since an underscore in prose is usually an identifier (snake_case);
bold/italic markers and link brackets still are.
