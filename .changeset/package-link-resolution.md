---
"@chbrain/khai-rules": patch
"@chbrain/khai-tests": patch
---

Hard links and the ambiguity rule (the composite-layer link contract). checkLinks resolves package-specifier links (`@scope/engine/member.md`) through a caller-supplied resolver and fails closed on an undeclared or missing dependency; khai-tests supplies the resolver from the consumer's own package.json (project mode, engine mode) so a hard link without a declared dependency is a build error. checkWiring learns qualified links: a bare wiring link satisfies a requirement only while its basename is unambiguous among installed engines -- where two engines ship the same file the link must qualify its package, and a link qualified to a different engine never satisfies. Additive: without the new options both checks keep their original behavior.
