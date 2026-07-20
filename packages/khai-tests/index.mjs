// Public API of the khai conformance kit. Importable by any package or repo
// that wants to validate khai content against the canon.

export {
  validateContentFile,
  validateEnginePackage,
  discoverEnginePackages,
  findEnginePackageFor,
  validateInstanceFile,
  validateProject,
  validateCollectionRegistry,
  validatePlayhouseRegistry,
  wiringRequirements,
  engineDocChecks,
  titleLeakAudit,
} from "./src/validate.mjs";
export {
  buildRegistry,
  verifyRegistry,
  resolveCollection,
  countItems,
  countPlays,
  deriveVersionFrom,
  deriveHouseVersion,
} from "./src/registry.mjs";
export {
  checkManagement,
  blueprintManagementDir,
  MANAGEMENT_CORE,
  MANAGEMENT_HOMES,
} from "./src/management.mjs";
export {
  buildScienceIndex,
  verifyScienceIndex,
  collectScience,
  renderScienceIndex,
  collectCollectionScience,
  renderCollectionIndex,
  surnames,
  SCIENCE_INDEX_PATH,
} from "./src/science.mjs";
export * as rules from "@chbrain/khai-rules";
export { parseDoc, sectionBody } from "@chbrain/khai-rules";
