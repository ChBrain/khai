---
"@chbrain/khai-tests": patch
---

validateEnginePackage now reads an engine's composition tree through the canon
(engineMembers / compositionOrder), so an explicit-members ladder engine
validates the same way as the anchor+expressions shorthand. Each content file is
checked against its own member type, the orphan check runs against the member
set, and the compose smoke runs over the tree leaves. No change for shorthand
engines (gender normalizes through the identical path).
