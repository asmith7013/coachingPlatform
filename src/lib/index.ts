// Import core modules
import * as coreModule from './core';

// Import data modules
import * as dataModule from './data';

// Import UI modules
import * as uiModule from './ui';

// Import utils modules
import * as utilsModule from './utils';

// Export namespaces
export const core = coreModule;
export const data = dataModule;
export const ui = uiModule;
export const utils = utilsModule;

// Re-export commonly used utilities directly
export { cn } from './utils/general/cn';

// Re-export commonly used tokens directly
export const {
  textSize,
  heading,
  weight,
  paddingX,
  paddingY,
} = uiModule.tokens;

// Re-export types
export type { School, SchoolInput } from './data/schemas/core/school';
export type { NYCPSStaff } from './data/schemas/core/staff'; 