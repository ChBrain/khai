---
"@chbrain/khai-tests": patch
---

`buildRegistry` was taught to take a `packageIds` map so a house mid-migration
can have its casts read in both shapes. Its own verify was not: `verifyRegistry`
and `validateCollectionRegistry` rebuild through `computeRegistry` to compare
against, and called it without the map. So a build that was handed the map and
the verify of that same build disagreed about the same house — the rebuild
derived no references for a group whose members had all migrated, and stopped on
the empty-group rule the same release introduced.

The map now threads the whole way: `buildRegistry` → `verifyRegistry` →
`validateCollectionRegistry` → `computeRegistry`, with `validatePlayhouseRegistry`
forwarding too. Every signature takes it optionally, so a flat house and every
existing caller are untouched.

The kit still never builds this map. The npm name of a unit follows a rule that
belongs to the house, and a kit that guessed it would be wrong for the next house
to migrate. Whether the kit should stop needing to be handed it at all — by
building the registry from `unitsOf` rather than a directory listing — is
a separate RFC (`packages/khai-tests/WALKING.md`), and this is not that.
