---
"@chbrain/khai-stage": patch
---

Sync the blueprint `khai-guard.config.json` `shared` list with the live houses.
The blueprint only declared `.changeset/**`, `package.json`, `package-lock.json`,
and `CHANGELOG.md` as lane-neutral, so a freshly stamped house could not edit
`.prettierrc`, `.gitignore`, `.npmrc`, `.nvmrc`, `LICENSE`, `LICENSE-CODE`,
`SECURITY.md`, or `registry.json` off the governance lane. The blueprint now
shares the same set Buechner and Kleist already use.
