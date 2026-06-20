// Public API of khai-rules: the pure, canon-agnostic validation mechanism.
// Every checker takes its contract as an argument and imports nothing from the
// canon. The dependency graph stays acyclic: khai-arch and khai-tests both pull
// *down* into here; nothing here points back up.

export * from "./rules.mjs";
export { parseDoc, parseFrontmatter, sectionBody } from "./parse.mjs";
