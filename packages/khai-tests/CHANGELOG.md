# @chbrain/khai-tests

## 0.0.5

### Patch Changes

- Updated dependencies [f34d674]
  - @chbrain/khai-arch@0.0.7

## 0.0.4

### Patch Changes

- Updated dependencies [e3fc4d4]
  - @chbrain/khai-arch@0.0.6

## 0.0.3

### Patch Changes

- Updated dependencies [dbb3892]
  - @chbrain/khai-arch@0.0.5

## 0.0.2

### Patch Changes

- Updated dependencies [b8549f6]
  - @chbrain/khai-arch@0.0.4

## 0.0.1

### Patch Changes

- Initial release: the khai conformance kit — rule atoms and
  `validateContentFile` / `validateEnginePackage` / `discoverEnginePackages`,
  plus a `khai-tests` CLI, validating content packages against the
  architecture canon. Depends on `@chbrain/khai-arch`.

- Add the consumer surface for projects that _use_ engines:
  `validateProject` / `validateInstanceFile` / `wiringRequirements`, plus the
  `checkWiring` rule atom. Engines declare wiring requirements in their manifest
  (`requires: [{ on, section, link }]`); the kit discovers a project's instance
  files by their `khai:` frontmatter and enforces that each instance links the
  required engine target in the required section — e.g. every persona must link
  a gender expression under Projection. Engine declares, kit enforces, mirroring
  arch-declares-types / kit-enforces-them. `validateContentFile` now treats
  `owner` as optional so a consumer's own instances validate structurally
  without asserting khai ownership.

- Add a `--project [dir]` mode to the `khai-tests` CLI for downstream repos:
  it reads the installed engines' manifests from `node_modules/@chbrain/*`,
  discovers the repo's instance files by their `khai:` frontmatter, and enforces
  the canon plus every engine wiring requirement, exiting non-zero on failure
  (drops straight into CI or a pre-commit hook). The existing file-path mode
  (engine-package validation) is unchanged. Wiring links into installed engine
  content are exempt from the local broken-link check, since they resolve via
  npm rather than being co-located. Adds a README documenting both modes.
