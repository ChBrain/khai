# @chbrain/khai-engine-negotiation

## 0.2.0

### Minor Changes

- 80ae42f: Take the engine's own name on the two phases that collided:
  `process_exploration` → `process_negotiation_exploration`, `process_resolution`
  → `process_negotiation_resolution`. Frees `exploration` for the composite and
  `resolution` for `betrayal`. Member files are API and renaming one is breaking,
  hence minor.

## 0.1.1

### Patch Changes

- 6c2d633: Add negotiation engine: how parties with competing interests pursue agreement, with preparation, exploration, invention, and resolution phases.
- a55dcce: Declare the `@chbrain/khai-arch` runtime dependency that `index.mjs` imports (`compositionOrder`); it previously resolved only via workspace hoisting, so a standalone install failed to load. Also declare the `@chbrain/khai-tests` devDependency the suite imports and align vitest to `^4.1.9`.

## 0.1.0

### Patch Changes

- Add negotiation engine: how parties with competing interests pursue agreement, with preparation, exploration, invention, and resolution phases.
