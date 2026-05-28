import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

export interface LoadedFile {
  /** path relative to repo root, e.g. "architecture/plot.md" */
  path: string;
  /** raw file contents as bytes */
  bytes: Buffer;
  /** raw file contents as utf-8 string */
  text: string;
}

export function loadDirectory(absoluteDir: string, repoRoot: string): LoadedFile[] {
  let entries: string[];
  try {
    entries = readdirSync(absoluteDir);
  } catch {
    return [];
  }
  return entries
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const abs = join(absoluteDir, name);
      const bytes = readFileSync(abs);
      return {
        path: relative(repoRoot, abs).replace(/\\/g, "/"),
        bytes,
        text: bytes.toString("utf-8"),
      };
    });
}

export function loadArchitectureSpecs(repoRoot: string): LoadedFile[] {
  return loadDirectory(join(repoRoot, "architecture"), repoRoot);
}

export function loadFixtures(repoRoot: string, kind: "valid" | "invalid"): LoadedFile[] {
  return loadDirectory(join(repoRoot, "tests", "fixtures", kind), repoRoot);
}
