// Import schema modules
import * as schemasModule from './schemas';

// Import form modules
import * as formsModule from './forms';

// Import hook and server action modules directly
import * as hooksModule from './hooks';
import * as serverActionsModule from './server-actions';

// Export namespaces to avoid conflicts
export const schemas = schemasModule;
export const forms = formsModule;
export const hooks = hooksModule;
export const serverActions = serverActionsModule;

// For commonly used types, we can re-export them directly
export type { School, SchoolInput } from './schemas/core/school';
export type { NYCPSStaff, TeachingLabStaff } from './schemas/core/staff'; 