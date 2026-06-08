import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseDoc } from "@chbrain/khai-rules";
import { validatePlayhouseRegistry } from "./validate.mjs";

export function buildRegistry(root) {
  const packageJsonPath = join(root, "package.json");
  if (!existsSync(packageJsonPath)) {
    throw new Error(`missing package.json at ${root}`);
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  const name = packageJson.name;
  const version = packageJson.version;

  const playsDir = join(root, "plays");
  if (!existsSync(playsDir)) {
    throw new Error(`missing plays directory at ${root}`);
  }

  const subdirs = readdirSync(playsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));

  const plays = [];
  for (const id of subdirs) {
    const playSubdir = join(playsDir, id);
    const files = readdirSync(playSubdir);
    const playFileName = files.find((f) => f.startsWith("play_") && f.endsWith(".md"));
    if (!playFileName) {
      console.warn(`Warning: playbook file play_*.md not found in plays/${id}`);
      continue;
    }

    const playFile = join(playSubdir, playFileName);

    const text = readFileSync(playFile, "utf8");
    const doc = parseDoc(text);
    if (!doc.ok) {
      throw new Error(`failed to parse playbook frontmatter of plays/${id}/${playFileName}`);
    }

    const title = doc.data?.title || id;

    // Parse blurb description under ## Arc
    let description = "";
    const content = doc.body || "";
    const arcMatch = content.match(/^##\s+Arc\s*$/im);
    if (arcMatch) {
      const startIndex = arcMatch.index + arcMatch[0].length;
      const rest = content.slice(startIndex).trim();
      const nextHeadingMatch = rest.match(/^##\s+/m);
      const sectionText = nextHeadingMatch ? rest.slice(0, nextHeadingMatch.index).trim() : rest;
      const paragraphs = sectionText
        .split(/\r?\n\r?\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      description = paragraphs[0] || "";
    }

    plays.push({
      id,
      title,
      description,
    });
  }

  // plays are pushed in subdir order, which is already sorted by localeCompare
  // above, so the output is deterministic without a second sort.

  const registryData = {
    $schema: "http://json-schema.org/draft-07/schema#",
    name,
    version,
    plays,
  };

  const registryPath = join(root, "registry.json");
  writeFileSync(registryPath, JSON.stringify(registryData, null, 2) + "\n", "utf8");

  // build extracts blurbs best-effort; surface (without failing) anything the
  // verify gate will later reject so the author can fix it before committing.
  const check = verifyRegistry(root);
  if (!check.ok) {
    console.warn("Warning: built registry.json does not yet pass verification:");
    for (const err of check.errors) {
      console.warn(`  - ${err}`);
    }
  }
}

export function verifyRegistry(root) {
  const results = validatePlayhouseRegistry(root);
  if (results.length > 0) {
    return {
      ok: false,
      errors: results[0].errors,
    };
  }
  return { ok: true, errors: [] };
}
