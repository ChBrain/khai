// Public API of the khai conformance kit. Importable by any package or repo
// that wants to validate khai content against the canon.

export {
  validateContentFile,
  validateEnginePackage,
  discoverEnginePackages,
  findEnginePackageFor,
  validateInstanceFile,
  validateProject,
  validatePlayhouseRegistry,
  wiringRequirements,
  engineDocChecks,
} from "./src/validate.mjs";
export { buildRegistry, verifyRegistry } from "./src/registry.mjs";
export * as rules from "@chbrain/khai-rules";
export { parseDoc, sectionBody } from "@chbrain/khai-rules";
