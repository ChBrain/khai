# @chbrain/khai-engine-gift

## 0.1.2

### Patch Changes

- Updated dependencies [ebc47ef]
- Updated dependencies [dca4385]
- Updated dependencies [1130323]
- Updated dependencies [c4a7220]
  - @chbrain/khai-arch@0.2.0

## 0.1.1

### Patch Changes

- ac87fd9: Declare the `@chbrain/khai-arch` runtime dependency that `index.mjs` imports (`compositionOrder`); it previously resolved only via workspace hoisting, so a standalone install failed to load. Also declare the `@chbrain/khai-tests` devDependency the suite imports and align vitest to `^4.1.9`.
- 92155d7: Add gift engine: how a gift creates obligation, binds the parties, and requires a return, with giving, receiving, and reciprocating phases.

## 0.1.0

### Patch Changes

- Add gift engine: how a gift creates obligation, binds the parties, and requires a return, with giving, receiving, and reciprocating phases.
