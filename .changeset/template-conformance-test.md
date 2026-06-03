---
"@chbrain/khai-tests": patch
---

Add the template conformance test: assert every authoring template shipped by
`@chbrain/khai-arch` is a valid content instance (`validateContentFile`, no
`owner` so the check is structural). The loop closes — the kit proves the
canon's templates, and the templates feed the kit's notion of a valid `<type>`.
