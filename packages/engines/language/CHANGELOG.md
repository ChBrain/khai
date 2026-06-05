# @chbrain/khai-engine-language

## 0.1.2

### Patch Changes

- 0af21a2: Declare a `title` in each engine file's frontmatter, matching the file's H1
  name (e.g. "Speaking, Borrowed"). Gives consumer surfaces a clean, declared
  title to render instead of deriving one from the filename.
- Updated dependencies [c5cb182]
- Updated dependencies [7dc7952]
- Updated dependencies [6bffe4e]
  - @chbrain/khai-arch@0.1.3

## 0.1.1

### Patch Changes

- 8bb5fa5: Add the language engine (Element 1, language as process): the channel and width
  ladder lifted to khai core. A root (using language), four input/output channels
  (speaking, hearing, reading, writing) and an internal channel (thinking), each
  running across its widths from a borrowed grip up to mother tongue. Ships the
  members manifest, the WIRES card, a members-aware compose(), a generated README,
  and the LORE reference.
- 2f26bba: Declare the engine's wiring contract. The law links the root from the
  Instructions Knowledge chapter, and each persona links a channel-and-width leaf
  under Projection; both at fail level. The WIRES card require and setup sentences
  are sharpened to name those two altitudes precisely. Resolution of these on a
  consumer needs the members-aware resolver in @chbrain/khai-tests.
