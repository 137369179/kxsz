export { MODULE_LOADERS, MODE_TO_MODULE } from "./moduleRegistry.js";
export { installBrowserShims } from "./browserShims.js";
export {
  initGlobalListeners,
  sparkleAt,
  initClickSparkles,
  initKeyboardShortcuts,
  warmupNeuralVoice
} from "./appFx.js";
export {
  ensureModule,
  prefetchModule,
  transitionToMode,
  endStudySession,
  beginStudySession,
  ensureDailyLimitAllowsStudy,
  switchMode,
  startLearnFlow
} from "./appNavigation.js";
export {
  init,
  removeLoader,
  initAntiAddiction,
  showRestModal
} from "./appInit.js";
