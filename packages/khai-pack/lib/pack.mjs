// khai-pack spine — the serve engine. Assemble a bundle in the khai "cultures"
// layout (overhead files at the bundle root, content files flat in one
// subfolder), run an injected guard, and emit a deterministic zip + a manifest
// carrying the content hash. Kind-agnostic: the consumer decides what its
// overhead and content are and how the bundle is checked (the guard). Pure: no
// filesystem, no network — buffers in, a result out.

import { createHash } from "node:crypto";
import { zipStore } from "./zip.mjs";

/** sha256 hex of a Buffer or string (string is hashed as UTF-8). */
export const sha256 = (data) => createHash("sha256").update(data).digest("hex");

const toBuf = (d) => (Buffer.isBuffer(d) ? d : Buffer.from(String(d), "utf8"));
const norm = (p) =>
  String(p)
    .replace(/\\/g, "/")
    .replace(/^\.?\/+/, "");

/**
 * @typedef {{ path: string, data: Buffer|string }} BundleFile
 *
 * @param {object} spec
 * @param {string} spec.name                          bundle name; the zip's single root folder
 * @param {BundleFile[]} [spec.overhead]              root-level files (README, LICENSE, SKILL.md, ...)
 * @param {{ dir: string, files: BundleFile[] }} [spec.content]   the flat content subfolder
 * @param {(files: {name:string,data:Buffer}[]) => ({errors?:string[],warnings?:string[]})} [spec.guard]
 * @param {object} [spec.stamp]                        provenance recorded in the manifest
 * @returns {{ name:string, files:{name:string,data:Buffer}[], zip:Buffer, zipSha256:string, manifest:object, errors:string[], warnings:string[], ok:boolean }}
 */
export function packBundle({ name, overhead = [], content, guard, stamp = {} }) {
  if (typeof name !== "string" || !/^[^/\\]+$/.test(name))
    throw new Error(`packBundle: name must be a single path segment, got "${name}"`);
  if (content && (typeof content.dir !== "string" || !content.dir.trim()))
    throw new Error(`packBundle(${name}): content.dir is required when content is given`);

  // cultures layout: overhead at <name>/<path>, content at <name>/<dir>/<path>.
  const files = [
    ...overhead.map((f) => ({ name: `${name}/${norm(f.path)}`, data: toBuf(f.data) })),
    ...(content
      ? content.files.map((f) => ({
          name: `${name}/${norm(content.dir)}/${norm(f.path)}`,
          data: toBuf(f.data),
        }))
      : []),
  ];

  if (files.length === 0) throw new Error(`packBundle(${name}): a bundle needs at least one file`);
  const seen = new Set();
  for (const f of files) {
    if (seen.has(f.name)) throw new Error(`packBundle(${name}): duplicate path "${f.name}"`);
    seen.add(f.name);
  }

  const g = guard ? (guard(files) ?? {}) : {};
  const errors = g.errors ?? [];
  const warnings = g.warnings ?? [];

  const zip = zipStore(files);
  const zipSha256 = sha256(zip);

  const manifest = {
    name,
    layout: "cultures",
    root: overhead.map((f) => norm(f.path)),
    content: content
      ? { dir: norm(content.dir), files: content.files.map((f) => norm(f.path)) }
      : null,
    zipSha256,
    ...stamp,
  };

  return { name, files, zip, zipSha256, manifest, errors, warnings, ok: errors.length === 0 };
}
