---
"@chbrain/khai-skills": patch
---

Pitch tuning model across the playwright and director skills.

The playwright now ships the khai default pitches (references/pitch.md) to learn
from, beside the template, and links the pitch from the play: recommend one pitch
per play (the default key), a plot may tune its own (the exception). Writing a
play tunes a default into a play-specific pitch, authored from template_pitch.md
and linked from the Company. Author one only when the play or a plot has a native
key worth fixing.

The director tunes for staging from two sources: the khai default pitches AND the
play's own pitch (if it tuned one). It takes the play's pitch as the starting key
and re-tunes from the defaults as the staging asks; where the play left the pitch
open, it tunes one from the defaults itself. So: playwright learns from the
defaults and produces play specifics; director uses the defaults and the play
specific to tune for the run.
