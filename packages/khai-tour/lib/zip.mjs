/**
 * khai-tour zip: a minimal, dependency-free ZIP writer.
 *
 * khai-tour ships no runtime dependencies (the aggregator uses node's built-in
 * glob), and the deployment bundle follows suit: this writes a standard ZIP
 * (local file headers + central directory + EOCD) over `node:zlib`, rather than
 * pulling in `archiver` / `jszip`. Entries are DEFLATE-compressed when that is
 * smaller, STOREd otherwise. Timestamps are fixed (1980-01-01) so the same input
 * yields a byte-identical archive — reproducible bundles.
 */

import { deflateRawSync, crc32 } from "node:zlib";

const LOCAL_SIG = 0x04034b50;
const CENTRAL_SIG = 0x02014b50;
const EOCD_SIG = 0x06054b50;
const DOS_EPOCH_DATE = 0x21; // 1980-01-01: ((1980-1980)<<9)|(1<<5)|1
const DOS_EPOCH_TIME = 0x00; // 00:00:00
const VERSION = 20; // ZIP 2.0 (DEFLATE)
const METHOD_STORE = 0;
const METHOD_DEFLATE = 8;

/**
 * Build a ZIP archive from a list of entries.
 *
 * @param {{ name: string, data: string | Buffer }[]} entries - archive members;
 *   `name` is the path inside the archive (forward slashes), `data` the contents
 * @returns {Buffer} the complete ZIP archive
 */
export function zip(entries) {
  const local = [];
  const central = [];
  let offset = 0;

  for (const entry of entries) {
    const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data, "utf8");
    const name = Buffer.from(entry.name, "utf8");
    const crc = crc32(data) >>> 0;

    const deflated = deflateRawSync(data);
    const stored = deflated.length >= data.length;
    const body = stored ? data : deflated;
    const method = stored ? METHOD_STORE : METHOD_DEFLATE;

    const lfh = Buffer.alloc(30);
    lfh.writeUInt32LE(LOCAL_SIG, 0);
    lfh.writeUInt16LE(VERSION, 4);
    lfh.writeUInt16LE(0, 6); // flags
    lfh.writeUInt16LE(method, 8);
    lfh.writeUInt16LE(DOS_EPOCH_TIME, 10);
    lfh.writeUInt16LE(DOS_EPOCH_DATE, 12);
    lfh.writeUInt32LE(crc, 14);
    lfh.writeUInt32LE(body.length, 18);
    lfh.writeUInt32LE(data.length, 22);
    lfh.writeUInt16LE(name.length, 26);
    lfh.writeUInt16LE(0, 28); // extra length
    local.push(lfh, name, body);

    const cdh = Buffer.alloc(46);
    cdh.writeUInt32LE(CENTRAL_SIG, 0);
    cdh.writeUInt16LE(VERSION, 4); // version made by
    cdh.writeUInt16LE(VERSION, 6); // version needed
    cdh.writeUInt16LE(0, 8); // flags
    cdh.writeUInt16LE(method, 10);
    cdh.writeUInt16LE(DOS_EPOCH_TIME, 12);
    cdh.writeUInt16LE(DOS_EPOCH_DATE, 14);
    cdh.writeUInt32LE(crc, 16);
    cdh.writeUInt32LE(body.length, 20);
    cdh.writeUInt32LE(data.length, 24);
    cdh.writeUInt16LE(name.length, 28);
    cdh.writeUInt16LE(0, 30); // extra length
    cdh.writeUInt16LE(0, 32); // comment length
    cdh.writeUInt16LE(0, 34); // disk number start
    cdh.writeUInt16LE(0, 36); // internal attributes
    cdh.writeUInt32LE(0, 38); // external attributes
    cdh.writeUInt32LE(offset, 42); // local header offset
    central.push(cdh, name);

    offset += lfh.length + name.length + body.length;
  }

  const localBuf = Buffer.concat(local);
  const centralBuf = Buffer.concat(central);

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(EOCD_SIG, 0);
  eocd.writeUInt16LE(0, 4); // this disk
  eocd.writeUInt16LE(0, 6); // disk with central directory
  eocd.writeUInt16LE(entries.length, 8); // entries on this disk
  eocd.writeUInt16LE(entries.length, 10); // total entries
  eocd.writeUInt32LE(centralBuf.length, 12); // central directory size
  eocd.writeUInt32LE(localBuf.length, 16); // central directory offset
  eocd.writeUInt16LE(0, 20); // comment length

  return Buffer.concat([localBuf, centralBuf, eocd]);
}
