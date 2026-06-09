# @chbrain/khai-engine-stack

## 0.1.0

### Minor Changes

- Initial release. The stack engine carries the HACKS spine a world runs on: the
  collaboration instructions (flavored, starting with `raw`) and the stack
  extension point (`stack.md`). It does not ship khai-type content, so it is not
  certified through the shared conformance kit; it ships its own structural
  tests instead. `compose({ flavor })` returns the instructions for a flavor,
  defaulting to `raw`; vendor-specific adaptations and other flavors slot in as
  sibling `instructions_<flavor>.md` files without moving the stack.
