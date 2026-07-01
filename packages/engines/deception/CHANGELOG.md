# @chbrain/khai-engine-deception

## 0.1.1

### Patch Changes

- 6d9f04b: Deepen the deception engine references: add foundational sources (Ekman on leakage, Goffman on impression management, Levine's truth-default, McCornack's information manipulation) to the Origin and Encoding.
- 19e4fa3: Declare the `@chbrain/khai-arch` runtime dependency that `index.mjs` imports (`compositionOrder`); it previously resolved only via workspace hoisting, so a standalone install failed to load. Also declare the `@chbrain/khai-tests` devDependency the suite imports and align vitest to `^4.1.9`.
- 243e8a8: Add deception engine: the deliberate creation of a false belief in another without their consent, with construction, delivery, and maintenance phases.

## 0.1.0

### Patch Changes

- Add deception engine: the deliberate creation of a false belief in another without their consent, with construction, delivery, and maintenance phases.
