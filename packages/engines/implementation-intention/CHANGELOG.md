# @chbrain/khai-engine-implementation-intention

## 0.1.1

### Patch Changes

- e087ed6: Declare the `@chbrain/khai-arch` runtime dependency that `index.mjs` imports (`compositionOrder`); it previously resolved only via workspace hoisting, so a standalone install failed to load. Also declare the `@chbrain/khai-tests` devDependency the suite imports and align vitest to `^4.1.9`.
- dfd1a32: Add implementation-intention engine: the if-then plan that bridges a goal intention to its execution, with planning, triggering, and executing phases.

## 0.1.0

### Patch Changes

- Add implementation-intention engine: the if-then plan that bridges a goal intention to its execution, with planning, triggering, and executing phases.
