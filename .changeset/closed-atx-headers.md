---
"@chbrain/khai-rules": patch
---

parseDoc and sectionBody now agree on a closed-ATX heading (`## Has ##`).
parseDoc stripped only the leading hashes, so it indexed the header as "Has ##"
while sectionBody looked for "Has" — desyncing the checks (checkH2SetAndOrder
saw a name mismatch while checkOwner/checkWiring reported the section missing,
two contradictory errors for one header). parseDoc now strips the space-led
trailing run of `#`, and sectionBody tolerates it, so both resolve the same
name. A lone `#` not preceded by a space (e.g. "C#") is kept as text.
