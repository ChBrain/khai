---
"@chbrain/khai-engine-gender": patch
---

Voice-clean the WIRES card prose. The `" - "` clause dashes in `card.wire`,
`require`, `enforce`, and `setup` become `, ; : ( )`, matching the house voice.
The card is what the website renders, so this was the last unclean surface in
the engine: the `.md` files were already clean, but card prose lives in
`package.json` and is not reached by the `.md` doc-checks.
