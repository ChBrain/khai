---
---

Tests for the play-level orphan wall: `playOrphanErrors` flags an instance the play never lists, passes when every instance is listed (Company + Triggers), ignores a non-instance doc (no `khai:` frontmatter), never flags the play file itself, and skips a play whose file links nothing local. Tests only; ships nothing.
