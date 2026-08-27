---
"@chbrain/khai-tests": patch
---

Collect the Playwright instructions of the packages a repository installs.

Every khai package that publishes typed content ships a
`playwright_instructions.md`, and 376 of them exist across the engines and
composites because the validator has required one since the convention began.
Nothing read them for the Playwright. The guidance a package wrote about its own
wiring reached the author only if a model happened to open the file, which is a
person remembering doing a computer's job.

`collectInstructions(root)` walks the **declared** dependency closure and returns
what it finds, deepest dependency first. Declared rather than scanned is the
point: a hoisted workspace holds every package's dependencies in one directory,
so a scan would hand a repository a stranger's instructions. A cultures house
gets the language engine and its tongues; a different house gets its own.
Nothing about any domain enters khai.

`khai-tests instructions [--root .]` renders it. Two layers, because five
chapters times a large closure is a context bomb and a Playwright casts from a
few packages: the default carries each package's one-line exported `law`, and the
chapters come only for `--package <name>` or `--full`. `--law` executes each
entry point, so running dependency code stays the caller's choice.

This also gives `law` a reader. Forty packages export one and nothing consumed
it.

**A production now ships a Playwright guide**, on the rule every engine already
obeys: a package that PUBLISHES khai typed content ships one. The first draft of
the production contract left it out alongside the WIRES card and the generated
README, and that was wrong in a way the other two are not -- a production is
precisely the thing a Playwright casts FROM. The rule is not "engines and
composites", it is "whatever publishes khai types", and tooling needs no
carve-out: the two tooling packages carrying a `khai:`-framed design record ship
neither, since both sit outside `files`.

**`validateProject` no longer walks the guide as content**, which building the
above exposed. It is dev-steering, so treating it as part of the production made
an English authoring guide inside a German culture demand a `declared`, and made
every engine wiring law aimed at a project's Instructions chapter fire on it.
Neither was a real fault; both were the check reading the wrong kind of file. The
collision and orphan rules already exempted it for exactly this reason.
