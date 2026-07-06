---
"@chbrain/khai-language": patch
---

Register Italy and France regional/minority languages in the franc detection
tier. Registry-only — no logic change, no new dependency. Each verified
multi-sample (own prose tops clean, national languages flagged outside the
margin):

- **Italy** — `sc`→`src` Sardinian (franc's Logudorese code, the Malay-`zlm`
  routing pattern), `fur` Friulian, `lld` Ladin.
- **France** — `br`→`bre` Breton (isolated, clean), `co`→`cos` Corsican (clean
  own prose; Italian the near-sibling at gap ~0.16, the tightest of the set).

Exempt and documented: Sicilian (`scn`) and Neapolitan (`nap`) — no franc model,
read as Corsican/Italian; Lombard/Piedmontese — absent from the model; Alsatian
(`gsw`) — rides the Standard-German margin (the documented 2-in-3 false-fail, a
fresh re-test agreed). Venetian (`vec`) and Ligurian (`lij`) probe clean and are
noted as available but held out for scope. Documented in `LANGUAGES.md`.
