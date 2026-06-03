---
"@chbrain/khai-tests": patch
---

Section contract: derive the TO-prefix from the canon instead of hardcoding it.
The full H2 list spells the type's mnemonic, so a "TO \_\_\_" type carries a two
section prefix ahead of its chapters (the "T", the group above, and the "O",
Owner, the origin), while a type whose mnemonic does not begin with "TO "
(instructions=HACKS, play=ENACTS, engines=WIRE) carries neither -- its chapters
spell the whole word.

The kit now pulls the prefix vocabulary from khai-arch (`toPrefix`, guarded with
a fallback), drops the dead `checkTitle` echo (the T slot is the group above,
never a re-name of the H1, so its only contract is presence in the H2 set), and
keeps the Owner value check for engine content. A migration tolerance accepts
the legacy "Title" spelling of the T slot until the Title -> Taxonomy rename
lands end to end. Also drops the stray Title/Owner from the instructions wiring
fixture and adds a regression test for the contract.
