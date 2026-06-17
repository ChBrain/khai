---
"@chbrain/khai-stage": patch
---

Stage template now ships and exports `registry.json`. `index.mjs` already writes
a `registry.json` into every raised house, but the blueprint `package.json.tmpl`
left it out of `files` and declared no `exports` — so every house published
without it, forcing consumers (e.g. the website loader) onto the deprecated `##
Arc` markdown fallback. Add `registry.json` to `files` and an `exports` map
(`.`, `./package.json`, `./registry.json`), matching the houses that were fixed
by hand. Future houses now ship the registry by default.
