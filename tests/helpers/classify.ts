import type { LoadedFile } from "./load-spec.js";

export type FileKind = "spec" | "companion";

/**
 * A file is a typed spec if it begins with a YAML frontmatter block.
 * Stack.md and any other companion files have no frontmatter.
 */
export function classify(file: LoadedFile): FileKind {
  return file.text.startsWith("---\n") ? "spec" : "companion";
}
