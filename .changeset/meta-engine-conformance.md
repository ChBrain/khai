---
"@chbrain/khai-tests": patch
---

Teach the conformance kit the `class: meta` engine (the spine). An engine that declares `class: meta` carries the flavored instructions and the architecture (the extension point) a world runs on, not a content engine wired into a house/element chapter. `validateEnginePackage` now skips the two content-only ceremonies for such an engine -- the WIRES card and the card-rendered README -- and reads its members as a flat list of meta-type instances (instructions, architecture), each validated against the canon exactly like any other instance. Content engines are unaffected.
