# @chbrain/khai-pack

The **serve engine**. Turns a typed bundle spec into a deterministic, guarded
zip in the khai **cultures layout**, so khai, and any repo that installs it, can
package content the same way instead of each rolling its own zip builder.

## The cultures layout

Every bundle is one root folder: **overhead at the root, flat content in a
subfolder**.

```
<name>/
  README.md  REFERENCES.md  LICENSE     ← overhead (root)
  <content-dir>/                        ← flat download stuff
     …the consumable files…
```

- A **skills** bundle: overhead = `SKILL.md`; content dir = `references/`.
- An **engine** bundle: overhead = `README.md`, `REFERENCES.md`, `LICENSE`,
  card; content dir = `engine/` with the member files.

## Kind-agnostic

khai-pack owns the spine (zip writer, layout, manifest, provenance hash) and
**nothing repo-specific**. The caller decides what its overhead and content are
and passes a `guard` that checks the assembled files. So a repo registers the
kinds it serves (reuse `skills` / `engine`, or define its own like `culture`);
khai-pack never forces a kind.

## Use

```js
import { packBundle } from "@chbrain/khai-pack";

const { zip, zipSha256, manifest, ok, errors } = packBundle({
  name: "creating-a-play",
  overhead: [{ path: "SKILL.md", data: skillMd }],
  content: { dir: "references", files: templates },
  guard: (files) => myKind.check(files), // { errors, warnings }
  stamp: { kind: "skills", standard: "agentskills@…" },
});
// write `zip` to disk; `manifest` records the layout + content hash.
```

`packBundle` is pure (buffers in, result out). The zip is byte-for-byte
reproducible (store method, fixed 1980 timestamp), so `zipSha256` is a stable
provenance anchor.
