---
"@chbrain/khai-language": patch
---

Register Spain's autonomous-community languages in the franc detection tier,
completing the Iberian co-official set:

- **Galician** (`gl` → `glg`) — the genuinely new language. Own prose tops
  franc clean at 1.0 across registers. As a gross-error catch it sits in the
  crowded Ibero-Romance field: firm against distant languages (English gap past
  0.4), a true within-margin sibling to Portuguese (won't split the two), and
  borderline against Castilian (gap 0.10–0.12, right at the margin). Documented
  with the honest limits in `LANGUAGES.md`.
- **Aranese / Occitan** (`oc` → `oci`) — clean top, Catalan ~0.86 back. This
  completes Catalonia, whose _third_ official language is Aranese.

Catalan (`ca`, also covering Valencian — same language under ISO) and Basque
(`eu`) already gated; Castilian Spanish (`es`) is built-in. Aragonese (`an`) has
no franc model — it reads as Occitan — so it stays exempt (the Gilbertese rule:
registering it would false-fail every paragraph). Documented in `LANGUAGES.md`.
