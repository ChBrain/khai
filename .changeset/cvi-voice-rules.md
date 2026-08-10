---
"@chbrain/khai-rules": patch
---

Port the text-level half of the CVI (the house writing rules) into khai-rules as `checkVoice`, a new `voice.mjs` atom. Covers every writing rule the CVI's §06 declares: the em dash and the en dash (`emDashMax`, `enDashMax`), square brackets and braces in prose (`brackets`), first person singular for the practice (`firstPersonPlural`), supplicant phrasing (`supplicantPhrases`), and "full stops over flourishes, two short sentences beat one long one" (`maxSentenceWords`, `exclamationMax`), plus a doubled-space rule (`doubledSpace`). Markdown-aware: frontmatter, fenced code blocks, inline code spans, link destinations and URLs are masked before any rule reads a line, and line numbers stay absolute in the original text.

Mechanism only, and inert by design: every rule is off unless the caller's contract switches it on, so `checkVoice(text)` returns `[]` for any input. Nothing is wired into the conformance kit or CI, and no existing khai content is affected. The visual half of the CVI (palette, page structure) is not portable and stays in the website repo. Also exports `fencedLines` from `parse.mjs`, so a prose rule and the header scan skip a code block at exactly the same lines.
