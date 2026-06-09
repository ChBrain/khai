# @chbrain/khai-engine-spine

## 0.1.1

### Patch Changes

- 97bae7f: Add the spine engine: the `class: meta` layer a world runs on -- the collaboration instructions (by flavor, starting with `raw`) and the architecture (the extension point). It ships two meta-type instances, `instructions_raw.md` (HACKS) and `architecture.md` (TO GROW), validated through the conformance kit's meta branch; `compose({ flavor })` returns the instructions for a flavor, defaulting to `raw`.
