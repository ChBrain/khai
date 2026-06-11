import { describe, it, expect } from "vitest";
import { inflateRawSync } from "node:zlib";
import { zip } from "../lib/zip.mjs";

// Read the first entry out of an archive by parsing its local file header, so the
// test proves the bytes we wrote are a readable ZIP, not just plausible-looking.
function firstEntry(buf) {
  const method = buf.readUInt16LE(8);
  const compressedSize = buf.readUInt32LE(18);
  const nameLen = buf.readUInt16LE(26);
  const extraLen = buf.readUInt16LE(28);
  const name = buf.subarray(30, 30 + nameLen).toString("utf8");
  const start = 30 + nameLen + extraLen;
  const body = buf.subarray(start, start + compressedSize);
  const data = method === 8 ? inflateRawSync(body) : body;
  return { name, method, data: data.toString("utf8") };
}

describe("zip", () => {
  it("writes a ZIP with the local-file magic and a matching entry count", () => {
    const buf = zip([
      { name: "a.txt", data: "hello" },
      { name: "dir/b.txt", data: "world" },
    ]);
    expect(buf.subarray(0, 4)).toEqual(Buffer.from([0x50, 0x4b, 0x03, 0x04])); // "PK\x03\x04"
    expect(buf.readUInt32LE(buf.length - 22)).toBe(0x06054b50); // EOCD signature
    expect(buf.readUInt16LE(buf.length - 22 + 10)).toBe(2); // total entries
  });

  it("round-trips a compressible entry through DEFLATE", () => {
    const payload = "khai ".repeat(500); // compresses, so method should be DEFLATE (8)
    const entry = firstEntry(zip([{ name: "big.md", data: payload }]));
    expect(entry.name).toBe("big.md");
    expect(entry.method).toBe(8);
    expect(entry.data).toBe(payload);
  });

  it("STOREs an entry that would not get smaller", () => {
    const entry = firstEntry(zip([{ name: "tiny.txt", data: "x" }]));
    expect(entry.method).toBe(0);
    expect(entry.data).toBe("x");
  });

  it("is reproducible: same input, identical bytes", () => {
    const make = () => zip([{ name: "a.txt", data: "hello" }]);
    expect(make().equals(make())).toBe(true);
  });
});
