---
"@chbrain/khai-methods": patch
---

parseMethod now honors its documented "returns null on parse error rather than
throwing" contract. It called gray-matter with no try/catch, so a single method
file with malformed YAML frontmatter threw a YAMLException that propagated
through listMethods / loadMethod / listMethodsByType, taking down the entire
registry API instead of dropping the one bad file via .filter(Boolean). Wrap
the read and parse so a bad file returns null and is skipped.
