---
"@chbrain/khai-skills": patch
---

Pitch tuning model across the playwright and director skills, on one canonical
source.

Both skills now inject the pitch defaults from the canon (defaults:pitch, from
@chbrain/khai-arch defaults/pitch.md) instead of carrying hand-authored copies, so
the "khai defaults" are a single source that cannot drift (provenance-checked at
build, like the element templates). The director gains a build directive for the
inject; the playwright adds it beside the element templates.

The model: the playwright learns from the khai default pitches and, when writing a
play, tunes one into a play-specific pitch (one per play, linked from the Company;
a plot may tune its own as the exception). The director tunes for staging from
both the khai defaults and the play's own pitch, starting from the play key and
re-tuning from the defaults, or tuning one itself where the play left it open.
