---
---

Cover the exemption ratchet: `exemptionStems` and `exemptionMeta` across both
config shapes, `touchedExemptions` firing only for the packages a diff is
standing in, and `homonymGrowth` refusing a bare addition while letting the list
shrink. Tests only — they do not ship, so no package content changes.
