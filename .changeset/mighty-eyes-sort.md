---
---

Layer khai's own `CLAUDE.md` on top of `packages/khai-arch/architecture/conduct.md`
(#1445), the shared case law for working in any khai house. Ships no package
content, hence empty.

Three moves, conservative by design:

1. Added a parallel blockquote right after "Voice first" pointing at conduct.md
   (shipped with `@chbrain/khai-arch`, read from
   `node_modules/@chbrain/khai-arch/architecture/conduct.md`) as the shared case
   law; the "Voice first" quote and this file's own status as the short,
   executable contract are untouched.
2. Trimmed only the two spots whose _reasoning_ now lives in conduct.md: the
   "Why this file is imperative" closing section (now two sentences pointing at
   law 5's closing paragraph and law 8, rather than restating the argument),
   and the framing sentence in "House voice, and it is checked" ("Where a rule
   here is enforced..."), which now points at law 5 instead of repeating it.
   The two enforced bullets under that heading are unchanged: they are contract,
   not case law.
3. Left the hard rules (1-7), the lanes table, the licence tables and every
   khai-guard command exactly as they were. None of that is rationale; all of
   it is enforcement, and conduct.md draws that same line in law 5 ("gate the
   decidable... leave taste as guidance").

The pointer only runs one way, quirks stay in this file, case law lives in
conduct.md, and this file never re-derives it. That is the design conduct.md
itself names in law 6: the khai-cultures house found that "two hand-maintained
copies of the truth always diverge" when its voice rules had one home and its
coding rules were sent to "the tool files, plural"; one file stayed current and
the other went stale. khai's CLAUDE.md goes first here so the repo that ships
conduct.md is the first house to restructure around it.
