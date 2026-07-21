---
"@chbrain/khai-tests": patch
---

Wall (order 1, completeness): gate the play-level orphan. A content instance that sits in a play directory but the play never lists (in its Company or Triggers) is a present-but-unlisted element, the reverse of `castingCoverageErrors` (which only flags a listed element no plot casts). This is the engine orphan check lifted to the play: the play file is the play's manifest, so every instance beside it must be linked from it. Conservative on a play that links nothing local (skipped, as `castingCoverageErrors` skips an empty Company); a non-instance doc (no `khai:` frontmatter) is ignored. Verified green: the real discussion play lists all eight of its local instance files. Set at patch as the free level; a new gate may warrant a minor at the maintainer's `bump:minor` label.
