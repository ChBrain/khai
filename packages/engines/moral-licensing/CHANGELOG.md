# @chbrain/khai-engine-moral-licensing

## 0.1.1

### Patch Changes

- e204b78: Add the moral-licensing engine (process) -- the self-regulation of a persona's moral conduct against a set-point, where past good buys latitude for a later lapse and past wrong drives compensatory good. The gap analysis (Tier-1 #12) found this homeless: the codebase held `moral-disengagement` (switching off self-sanction for a specific harm) but not the trade against a running moral balance, which keeps the standard intact and affords the lapse rather than justifying it.

  - **Root (process):** `moral-licensing` -- conduct held near a felt-sufficient set-point, the recent record bearing on present permission (Sachdeva's sinning saints and saintly sinners).
  - **Directions (process):**
    - `indulgence` -- the licensing arm: a prior good deed banks moral credit, and the persona spends it, feeling entitled to a lapse it would otherwise refuse (the moral-credits model; Monin & Miller).
    - `cleansing` -- the compensatory arm: a transgression or a threat to the moral self opens a deficit the persona repairs with compensatory good, or with the literal washing that stands in for it (the Macbeth effect; Zhong & Liljenquist).

  Warranted (LORE) on Monin & Miller (2001, the founding), Merritt/Effron/Monin (2010, the credits-vs-credentials review), Sachdeva/Iliev/Medin (2009, the set-point framing), and Zhong & Liljenquist (2006, the Macbeth effect).

  **Scope note -- the credentialing mechanism stays with `bias`.** The moral-licensing literature distinguishes two mechanisms: _moral credits_ (a running balance -- past good banked, later bad spends it) and _moral credentials_ (past good reframes an ambiguous later act as not-a-transgression). The `bias` engine already owns the credentialing reframe as its `position_moral_credential.md` member (a self-serving judgment bias in the self-credit family). To honor one-phenomenon-one-engine, this engine takes only the credits/balance dynamic (`indulgence`) plus the compensatory reverse (`cleansing`), and delegates the credential reframe to bias. Also bounded against `moral-disengagement` (the act afforded vs the harm reinterpreted as not-wrong), `moral-identity` (the standing centrality of morality that grounds the set-point vs the balancing around it), `guilt`/`disgust` (the emotions that drive and colour cleansing), and `dissonance` (the general inconsistency drive vs the specifically moral balance). Set at patch as the free level. No whitelist required -- the `moral_licensing`/`indulgence`/`cleansing` stems are unique (`vicarious` is self-efficacy's, `credit`/`credential` are bias's).

- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
  - @chbrain/khai-arch@0.1.23
