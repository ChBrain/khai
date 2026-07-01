# @chbrain/khai-engine-persuasion

## 0.1.1

### Patch Changes

- 237a787: Declare the `@chbrain/khai-arch` runtime dependency that `index.mjs` imports (`compositionOrder`); it previously resolved only via workspace hoisting, so a standalone install failed to load. Also declare the `@chbrain/khai-tests` devDependency the suite imports and align vitest to `^4.1.9`.
- 1d8ef4b: Add persuasion engine: how a persona attempts to change what another believes, values, or does, with appeal, reception, processing, and outcome phases.

## 0.1.0

### Patch Changes

- Add persuasion engine: how a persona attempts to change what another believes, values, or does, with appeal, reception, processing, and outcome phases.
