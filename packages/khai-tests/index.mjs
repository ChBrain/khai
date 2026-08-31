// Public API of the khai conformance kit. Importable by any package or repo
// that wants to validate khai content against the canon.

export {
  validateContentFile,
  validateEnginePackage,
  validateProductionPackage,
  PRODUCTION_CLASS,
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
  collectInstructions,
  renderInstructions,
  publishesContent,
  PLAYWRIGHT_INSTRUCTIONS,
} from "./src/instructions.mjs";
export { packedFiles, checkPacking, renderPacking, workspacePackages } from "./src/packing.mjs";
export { loadGates, runGates, renderGates, gateLine, VISIBILITY } from "./src/gates.mjs";
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
  scholarCollisions,
  renderScienceIndex,
  collectCollectionScience,
  renderCollectionIndex,
  surnames,
  SCIENCE_INDEX_PATH,
} from "./src/science.mjs";
export {
  loadWorkPolicy,
  normaliseWork,
  isContrast,
  roleOf,
  collectUnits,
  findOverlaps,
  pairsOf,
  scholarMatches,
  workMatches,
  checkCandidate,
  scanSurname,
  findUnresolvedNamesakes,
} from "./src/overlap.mjs";
export * as rules from "@chbrain/khai-rules";
export { parseDoc, sectionBody } from "@chbrain/khai-rules";
