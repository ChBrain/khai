# @chbrain/khai-tests

## 0.0.1

### Patch Changes

- Initial release: the khai conformance kit — rule atoms and
  `validateContentFile` / `validateEnginePackage` / `discoverEnginePackages`,
  plus a `khai-tests` CLI, validating content packages against the
  architecture canon. Depends on `@chbrain/khai-arch`.

- Add the consumer surface for projects that *use* engines:
  `validateProject` / `validateInstanceFile` / `wiringRequirements`, plus the
  `checkWiring` rule atom. Engines declare wiring requirements in their manifest
  (`requires: [{ on, section, link }]`); the kit discovers a project's instance
  files by their `khai:` frontmatter and enforces that each instance links the
  required engine target in the required section — e.g. every persona must link
  a gender expression under Projection. Engine declares, kit enforces, mirroring
  arch-declares-types / kit-enforces-them. `validateContentFile` now treats
  `owner` as optional so a consumer's own instances validate structurally
  without asserting khai ownership.
