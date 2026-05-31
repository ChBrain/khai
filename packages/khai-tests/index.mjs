// Public API of the khai conformance kit. Importable by any package or repo
// that wants to validate khai content against the canon.

export {
  validateContentFile,
  validateEnginePackage,
  discoverEnginePackages,
  findEnginePackageFor,
} from "./src/validate.mjs";
export * as rules from "./src/rules.mjs";
export { parseDoc, sectionBody } from "./src/parse.mjs";
