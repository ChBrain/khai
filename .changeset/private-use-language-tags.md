---
"@chbrain/khai-language": patch
---

Accept BCP-47 private-use subtags, for the varieties no registry names.

ISO 639-3 coverage tracks standardisation politics, not speakers: Bavarian has
`bar` for ~14 million, Saterland Frisian has `stq` for ~2,000, and Hessisch has
nothing for several million. A house writing one position per language variety
runs out of codes long before it runs out of varieties.

`language: de-x-hes` now resolves to `german` and gates the prose against German,
which is all a trigram model can honestly do for a variety it has no model for.

**Strip for routing, preserve for identity.** `resolveLanguage` returns the base;
the new `resolveLanguageTag` returns the tag as declared. The two questions are
different -- _what do I gate this prose against_ is answered by the base, _which
variety does this file claim_ only by the tag -- and normalization destroys the
second. A per-variety check keyed by tag needs it, so it stays reachable.

Two guards come with it.

**Syntax is validated, vocabulary never is.** A private-use section must be `-x-`
followed by subtags of 1-8 alphanumerics (RFC 5646 2.2.7), so `de-x-` and
`de-x-waytoolongsubtag` are findings. What `hes` means is the house's business;
a registry of somebody else's variety names is not khai's to hold.

**A private-use tag in `khai.languages` is a finding.** The exempt list is
compared against the resolved language, so `de-x-hes` there normalizes to
`german` and would exempt every German file in the house -- the author asks to
skip one variety and switches off a whole language, with nothing to say so.
Exempting a variety is not expressible, since a variety is gated against its
base, and the gate now says so rather than quietly obeying.

Stripping also restores a check that a raw tag would have silently dropped:
khai-tests keys its German title-leak audit on the resolved language name, so an
unstripped `de-x-hes` would have matched no marker set and stopped auditing.
