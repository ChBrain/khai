---
"@chbrain/khai-tests": patch
---

The validator no longer crashes on a malformed package.json. readManifest,
findEnginePackageFor, installedEngineManifests, the CLI's engine banner, and
engineDocChecks all parsed package.json with an unguarded JSON.parse, so a
single unreadable or malformed manifest (an installed dependency, or a file
mid-walk) threw an uncaught exception and aborted the pre-commit gate / project
validator with a raw stack trace. A shared readJsonOr helper now degrades
gracefully: a bad installed manifest is skipped, a bad file mid-walk is treated
as "no manifest here", and a bad package on the engine surface yields a clean
"cannot read or parse package.json" finding.
