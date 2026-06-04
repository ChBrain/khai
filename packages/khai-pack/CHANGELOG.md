# @chbrain/khai-pack

## 0.0.3

### Patch Changes

- c9eff7b: Add the `license-check` subcommand and `licensePolicy` config: every package must declare an allowed (NonCommercial) license and every SKILL.md a NonCommercial CC license, so khai's concepts can't be resold under a bare permissive license. Relicense khai-guard, khai-pack, and khai-rules from plain MIT to the dual-license string (`SEE LICENSE IN LICENSE and LICENSE-CODE`) — content NonCommercial, code MIT — to comply.

## 0.0.2

### Patch Changes

- 0d822cd: Add `@chbrain/khai-pack`, the serve engine: a zero-dep, kind-agnostic packaging
  spine that turns a typed bundle spec into a deterministic, guarded zip in the
  khai "cultures" layout (overhead at the bundle root, flat content in one
  subfolder), with an injected guard and a content-hash manifest. Shared
  replacement for per-repo zip builders; consumers register the kinds they serve
  (skills, engine, or their own).
