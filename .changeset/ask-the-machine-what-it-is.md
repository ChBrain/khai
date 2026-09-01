---
"@chbrain/khai-guard": patch
"@chbrain/khai-tests": patch
---

`khai-guard environment` reports what this machine is: platform, node, what npm
itself reports, how npm must be spawned here, the path separator, the line
ending, whether this process can create a directory symlink, and the shell
signals it can see. AGENTS.md asks every agent to run it before its first shell
command.

`npmSpawn` replaces `npmCommand` and asks in the order that costs least to be
wrong about. Under `npm run` and `npx` -- every path this repo uses -- npm sets
`npm_execpath` to its own CLI, a plain `.js` file, so `node <npm-cli.js>` is
identical on every OS: no shim, no shell, no platform branch. The platform guess
remains as a fallback, labelled `platform-guess` so an answer cannot be mistaken
for a fact.

That fallback is also on a clock. Node 24 deprecates passing args alongside
`shell: true` (DEP0190), which is exactly what the Windows guess must do, so the
report says so where it applies.
