---
"@chbrain/khai-plays": patch
---

A malformed registry card no longer crashes module import (and with it the CLI
that imports the module), which previously left no way to run the tool to fix
the card. The `houses` export is now resilient at import (a bad card yields an
empty bill rather than a thrown import), while `loadRegistry()` stays strict and
the CLI's render/register path catches it and blocks with a clear exit-1 message
naming the offending card -- so a bad card still blocks until fixed, it just no
longer throws on import. Malformed-JSON errors now name the file too.
