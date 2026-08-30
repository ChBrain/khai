import { buildCompositeLoader } from "@chbrain/khai-arch";
import { createRequire } from "node:module";
export const { compose, chains, anchor } = buildCompositeLoader(
  createRequire(import.meta.url)("./package.json"),
  new URL(".", import.meta.url).pathname,
);
