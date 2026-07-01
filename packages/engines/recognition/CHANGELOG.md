# @chbrain/khai-engine-recognition

## 0.1.1

### Patch Changes

- 922118a: Declare the `@chbrain/khai-arch` runtime dependency that `index.mjs` imports (`compositionOrder`); it previously resolved only via workspace hoisting, so a standalone install failed to load. Also declare the `@chbrain/khai-tests` devDependency the suite imports and align vitest to `^4.1.9`.
- dd345b0: Add recognition engine: the social acknowledgment of who a persona is or what they have done, with claim, encounter, and standing phases.

## 0.1.0

### Patch Changes

- Add recognition engine: the social acknowledgment of who a persona is or what they have done, with claim, encounter, and standing phases.
