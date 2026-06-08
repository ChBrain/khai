---
"@chbrain/khai-rules": patch
---

parseDoc and sectionBody now track fenced code blocks (```and ~~~) so a
heading that appears inside a code sample is no longer indexed as a real
section header. Previously a`## Section` shown in an example block could make
a document that was actually missing that section validate as correct (or make
a valid document fail), since every structural check builds on the header
index. sectionBody likewise no longer truncates a section at a fenced heading.
