---
"@chbrain/khai-tests": patch
---

Plan completion is now gated by `status`. Only a `closed` plan must resolve every
target (no pending `[ ]`); a `draft` or `active` plan is in progress, so an
in-world plan staged inside a play holds its targets as forward intent rather
than being failed as incomplete. The `order` type has no status lifecycle, so
its completion stays mandatory. Mirrors the scope-agnostic plan coda: completion
is a state a plan reaches, not a precondition every plan must meet.
