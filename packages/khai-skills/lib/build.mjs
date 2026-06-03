// khai-skills builder — the "npm deploy skill" step. Composes each skill in
// src/ into a self-contained, agentskills.io-conformant bundle by PULLING the
// canon (templates) from @chbrain/khai-arch at build time, validates it through
// the guard (standard + neutrality + provenance), and emits a deterministic
// per-skill zip plus a MANIFEST. The skill carries no hand-maintained copy of
// the canon: the duplication exists only in the build output, so a cheap or
// non-code-aware model gets a self-contained bundle while the single source of
// truth stays in khai-arch.

import {
  readFileSync,
  readdirSync,
  existsSync,
  statSync,
  mkdirSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, posix } from "node:path";
import { createRequire } from "node:module";
import matter from "gray-matter";
import arch from "@chbrain/khai-arch";
import { packBundle } from "@chbrain/khai-pack";
import { sha256, validateSkillMd, validateNeutrality, validateProvenance } from "./guard.mjs";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, "..");

export const PIN = JSON.parse(
  readFileSync(join(pkgRoot, "standards", "agentskills.pin.json"), "utf8"),
);
const ARCH_VERSION = require("@chbrain/khai-arch/package.json").version;

/** Resolve a build directive `from` token to its canon text. */
function resolveCanon(from) {
  const [kind, arg] = from.split(":");
  if (kind === "template") {
    const t = arch.templates[arg];
    if (!t) throw new Error(`unknown canon template "${arg}" (template:${arg})`);
    return t.text;
  }
  throw new Error(`unknown canon resolver "${from}" (expected template:<type>)`);
}

/** All files under a dir as { rel (posix), data:Buffer }, excluding given names. */
function walk(dir, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full, base));
    else
      out.push({
        rel: relative(base, full).split(/[\\/]/).join(posix.sep),
        data: readFileSync(full),
      });
  }
  return out;
}

/**
 * Compose one skill source dir into an in-memory bundle (no IO beyond reading
 * the source). Returns the file set, the guard findings, and provenance info.
 */
export function composeSkill(srcDir) {
  const name = srcDir.split(/[\\/]/).pop();
  const skillMdPath = join(srcDir, "SKILL.md");
  if (!existsSync(skillMdPath)) throw new Error(`${name}: missing SKILL.md`);

  const directive = existsSync(join(srcDir, "skill.build.json"))
    ? JSON.parse(readFileSync(join(srcDir, "skill.build.json"), "utf8"))
    : { inject: [] };
  const inject = directive.inject ?? [];
  const injectPaths = new Set(inject.map((i) => i.to));

  // Passthrough: everything the author bundled except the SKILL.md and the
  // build directive. A source file at an injected path is a forbidden copy of
  // the canon (provenance: pull, never duplicate).
  const errors = [];
  const passthrough = walk(srcDir).filter(
    (f) => f.rel !== "SKILL.md" && f.rel !== "skill.build.json",
  );
  for (const f of passthrough)
    if (injectPaths.has(f.rel))
      errors.push(
        `${name}: src carries "${f.rel}", which is injected from canon — remove the copy, the build pulls it from khai-arch`,
      );

  // Stamp the SKILL.md metadata (the spec-blessed string map) with provenance.
  const src = readFileSync(skillMdPath, "utf8");
  let parsed;
  try {
    parsed = matter(src);
  } catch (e) {
    return {
      name,
      files: [],
      errors: [
        `${name}/SKILL.md: invalid YAML frontmatter (${e.reason ?? e.message}) — quote values containing ':' or apostrophes`,
      ],
      warnings: [],
      injected: [],
    };
  }
  const injected = inject.map((i) => {
    const expected = resolveCanon(i.from);
    return { path: i.to, actual: expected, expected, data: Buffer.from(expected, "utf8") };
  });
  const stamped = matter.stringify(parsed.content, {
    ...parsed.data,
    metadata: {
      ...(parsed.data.metadata ?? {}),
      standard: `${PIN.standard}@${PIN.spec.sha256.slice(0, 12)}`,
      validator: `${PIN.validator.package}@${PIN.validator.version}`,
      canon: `@chbrain/khai-arch@${ARCH_VERSION}`,
      ...Object.fromEntries(
        injected.map((i) => [`canon:${i.path}`, sha256(i.expected).slice(0, 12)]),
      ),
    },
  });

  // Assemble the bundle file list (posix paths).
  const files = [
    { name: "SKILL.md", data: Buffer.from(stamped, "utf8") },
    ...injected.map((i) => ({ name: i.path, data: i.data })),
    ...passthrough.map((f) => ({ name: f.rel, data: f.data })),
  ];

  // Guard: Tier 1 (standard) on SKILL.md, Tier 2 (neutrality) on every text
  // file, provenance on injected canon.
  const v = validateSkillMd(stamped, { dirName: name });
  errors.push(...v.errors);
  const warnings = [...v.warnings];
  for (const f of files)
    errors.push(...validateNeutrality(f.data.toString("utf8"), { label: `${name}/${f.name}` }));
  errors.push(...validateProvenance(injected));

  return { name, files, errors, warnings, injected };
}

/**
 * Split a composed file set into the cultures layout khai-pack expects: root
 * files are overhead, files under one subfolder are the content. An agentskills
 * skill is SKILL.md (root) + references/ (the one content dir); more than one
 * content subfolder is not representable in the cultures layout yet.
 */
function culturesLayout(name, files) {
  const overhead = files
    .filter((f) => !f.name.includes("/"))
    .map((f) => ({ path: f.name, data: f.data }));
  const subFiles = files.filter((f) => f.name.includes("/"));
  const dirs = new Set(subFiles.map((f) => f.name.split("/")[0]));
  if (dirs.size > 1)
    throw new Error(
      `${name}: bundle has multiple content subfolders [${[...dirs].join(", ")}]; the cultures layout expects one`,
    );
  const dir = [...dirs][0];
  const content = dir
    ? { dir, files: subFiles.map((f) => ({ path: f.name.slice(dir.length + 1), data: f.data })) }
    : undefined;
  return { overhead, content };
}

/** Compose + validate (+ optionally write dist/ and zips). */
export function buildAll({ root = pkgRoot, write = false } = {}) {
  const srcRoot = join(root, "src");
  const distRoot = join(root, "dist");
  const skills = existsSync(srcRoot)
    ? readdirSync(srcRoot).filter((d) => statSync(join(srcRoot, d)).isDirectory())
    : [];

  if (write && existsSync(distRoot)) rmSync(distRoot, { recursive: true, force: true });

  const results = [];
  const manifest = {
    standard: PIN.standard,
    validator: `${PIN.validator.package}@${PIN.validator.version}`,
    builtAt: new Date().toISOString(),
    skills: [],
  };

  for (const skill of skills) {
    const r = composeSkill(join(srcRoot, skill));

    // Pack via the serve engine: it owns the zip writer, the cultures layout,
    // and the content-hash. khai-skills supplies the files and the stamp; the
    // skill conformance guard already ran in composeSkill.
    let zip = null;
    let zipSha = null;
    if (r.files.length > 0) {
      const { overhead, content } = culturesLayout(r.name, r.files);
      const packed = packBundle({
        name: r.name,
        overhead,
        content,
        stamp: {
          kind: "skills",
          standard: `${PIN.standard}@${PIN.spec.sha256.slice(0, 12)}`,
          validator: `${PIN.validator.package}@${PIN.validator.version}`,
        },
      });
      zip = packed.zip;
      zipSha = packed.zipSha256;
    }

    if (write && zip) {
      for (const f of r.files) {
        const dest = join(distRoot, r.name, ...f.name.split("/"));
        mkdirSync(dirname(dest), { recursive: true });
        writeFileSync(dest, f.data);
      }
      writeFileSync(join(distRoot, `${r.name}.zip`), zip);
    }

    manifest.skills.push({
      name: r.name,
      files: r.files.map((f) => f.name),
      zip: `${r.name}.zip`,
      zipSha256: zipSha,
      ok: r.errors.length === 0,
    });
    results.push({ ...r, zipSha });
  }

  if (write) {
    mkdirSync(distRoot, { recursive: true });
    writeFileSync(join(distRoot, "MANIFEST.json"), JSON.stringify(manifest, null, 2) + "\n");
  }

  return { results, manifest, ok: results.every((r) => r.errors.length === 0) };
}
