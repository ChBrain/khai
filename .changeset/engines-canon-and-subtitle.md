---
"@chbrain/khai-arch": patch
---

Add `engines` as the ninth typed spec and fix the architecture subtitle.

- **engines.md (WIRE)**: a new meta-class type for the extensions builders wire
  into the architecture seam. Chapters Wire / Issue / Require / Enforce cover
  where an engine attaches, what it offers, the contract it imposes on its host,
  and the test guarantee it owns. Sits alongside architecture (the seam) and
  instructions (the method) as canon substrate.
- **architecture.md**: subtitle "the growing of the world" -> "the growing of
  worlds" to keep the "the X-ing of <bare noun>" beat the other specs share
  (forces, conditions, forms ...); the article in "the world" was the odd one
  out.
- Companion + schema housekeeping: model.md lists Engines and stops calling
  Architecture "this document" (stale since the GROW rename); \_schema.yml and
  the README reflect nine typed specs.
