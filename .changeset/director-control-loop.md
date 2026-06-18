---
"@chbrain/khai-skills": patch
---

Rewrite the khai-director skill from a teller to a control-loop seat, and drop
its khai authoring templates.

The skill now runs a play as a living production: it makes the separation of two
stances (an immersed cast, the director outside reading and redirecting) the
first principle, since behaviour is evidence only if the reader did not produce
it. Adds the uncalled method and cold control runs, the play-latency vs
production-inertia distinction, the persistent-cast memory and permanent-
contamination rules, an outcome-first framing (explore plural readings or
converge to a handed-over script), the cast charter, and convergence by
steer-without-scripting. Capture is promoted from keepsake to a possible terminal
deliverable, assembled from what the cast performed and never authored by the
director.

Removes skill.build.json so the director no longer injects khai's element
templates (template_play, template_persona, ...): those are the playwright's
authoring schema and have no place in a portable directing skill. In their place
the bundle ships the references a directing skill actually expects: a director
position (the seat), a default persona (with the clear option to use your own),
and a pitch palette, so a persona holding the position runs the craft. The bundle
no longer depends on khai's file formats.

Adds a pitch knob and references/pitch.md: the director tunes a run to one
dominant pitch, the tonal key the fixed events are played in (grieving, comic,
dread, ...). The reference is a portable echo of the khai pitch type (TO TUNE:
Tenor, Undertow, Nerve, Echo) with a starting palette of tenors, so the skill
stays dependency-free while khai-arch owns the type. A pitch is a reading, never a
rewrite: the play's events do not change.
