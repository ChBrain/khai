---
"@chbrain/khai-tests": patch
---

Close two engine-self gaps. `validateEnginePackage` now regenerates each engine's
README from its manifest (via the canon's `renderEngineReadme`) and gates on
drift: a missing or hand-edited README is an error, so the pointer can never
disagree with the source of truth (deterministic, the answer is in the bytes).
The advisory docs lane also now flags an en/em-dash in a README or REFERENCES
doc, holding those files to the house voice ( , ; : () ) the way checkEncoding
already holds content instances.
