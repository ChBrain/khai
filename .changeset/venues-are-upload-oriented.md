---
"@chbrain/khai-tour": patch
---

Every interactive venue is upload-oriented, and repo-attachability is a separate
fact.

`claude_project` declared `source: "repo"`. That was wrong: it is uploaded to
like the others, and the field made the bundle look optional for a host that
needs it. Nothing branched on the value, which reaches exactly one CLI display
line, so no gate could see the error and a test pinned it.

`repoAttachable` now marks the hosts a human can additionally point at a
repository (`perplexity_space`, `gemini_gem`, the latter under its 10-file
limit). It is deliberately not the same field: what the host can ingest is the
human's option in its own UI, and it does not change what the Roadie builds.

Perplexity renamed Spaces to Projects, so the display name follows. The slug does
not: it keys the adaption fragment in `@chbrain/khai-engine-spine`, so renaming
it carries another package and belongs on a `rename/` lane.
