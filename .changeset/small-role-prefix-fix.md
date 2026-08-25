---
"@chbrain/khai-tests": patch
---

Fix `roleOf` against the parsed cell. The Origin reader strips emphasis, so a
`**Contrast.**` lead arrives as `Contrast.` and the asterisk-bearing prefixes
never matched — the declared roles shipped inert. The token is now matched on
the parsed form, must lead, and must be closed by a period or colon, so a cell
that merely opens with the word stays a spine.
