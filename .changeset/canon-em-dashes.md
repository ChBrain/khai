---
"@chbrain/khai-arch": patch
---

Typography: replace the 13 prose double-hyphens (`--`) in the canon with
the sanctioned spaced hyphen (` - `). Markdown smartypants rendered `--`
as an en-dash, slipping an en-dash-in-disguise past the CVI; the canon is
ASCII-only (see encoding.test.ts: em-dash forbidden, use ` - `). Affects
play, engines, architecture, and model. Structure (frontmatter fences,
coda separators, the model table rule) is untouched.
