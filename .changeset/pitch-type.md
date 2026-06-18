---
"@chbrain/khai-arch": patch
---

Add a new element type: pitch (mnemonic TO TUNE, chapters Tenor / Undertow /
Nerve / Echo). A pitch is the key a production is played in: the same fixed
events tuned to one dominant tone. It is chosen for a run, not written into the
events, so a different pitch is a different production of the same tale; a play
may carry a default tenor and the Director may tune it to another.

Pure canon addition: architecture/pitch.md (the spec), templates/template_pitch.md
(the fillable skeleton), and model.md (pitch joins the cast group and the type
list). The type registry and templates are data-driven, so no index.mjs change
was needed; the type-rules and frontmatter gates validate the new type
automatically (130 tests pass). This is the home of the Director's tonal register
knob, promoted from a skill-local palette to a first-class khai type.

(Adding a canonical type is arguably a minor; left at patch per the no-self-escalate
rule. Apply bump:minor if the maintainer prefers.)
