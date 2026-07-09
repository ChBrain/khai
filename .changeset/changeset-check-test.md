---
---

Test (dormant until the changeset-check scoping fix lands): a CLI-level case
proving that when `main` carries an unconsumed releasing changeset, a docs PR
that ships nothing and adds an empty changeset is NOT blocked, while a PR that
ships nothing but adds its own releasing changeset still is. Ships no package
content: an empty changeset.
