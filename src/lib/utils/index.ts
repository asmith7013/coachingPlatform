// Import directly from files to avoid TS module errors
import { cn } from './general/cn';
import { normalize, isMLR, mlrNum } from './general/routineUtils';
import { validateWithZod } from './general/zodValidation';

// Export checkFieldConfigCoverage from dev utils
import { checkFieldConfigCoverage } from './dev/checkFieldConfigCoverage';
import { mockSchools, mockNYCPSStaff, mockTLStaff } from './dev/mockData';

// Export server utilities
import { 
  standardizeResponse,
  fetchPaginatedResource
} from './server/index';

// Export all directly with namespaces for organization
export {
  // General utils
  cn,
  normalize, isMLR, mlrNum,
  validateWithZod,
  
  // Dev utils
  checkFieldConfigCoverage,
  mockSchools, mockNYCPSStaff, mockTLStaff,
  
  // Server utils
  standardizeResponse,
  fetchPaginatedResource
}; 