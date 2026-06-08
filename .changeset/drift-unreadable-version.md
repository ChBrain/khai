---
"@chbrain/khai-skills": patch
---

The drift check no longer reads an unreadable upstream validator version as
"still current". A reachable PyPI whose payload lacks `info.version` now yields
an empty string (distinct from offline, which is undefined), and checkDrift
surfaces that as an advisory notice instead of skipping it via a falsy guard.
Offline (both signals unreachable) still skips silently.
