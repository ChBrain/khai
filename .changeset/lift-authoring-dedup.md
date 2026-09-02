---
"@chbrain/khai-methods": patch
---

The authoring method carried a floor for cast size and nothing for the two
checks that come before a cast is written at all: is this candidate already
covered by an existing entry, and has its source list actually been checked
against the index rather than skimmed. Two prompts, Dedup and Scan, add those
checks in the abstract, lifted from case law two houses running khai-authoring
had already worked out on their own.
