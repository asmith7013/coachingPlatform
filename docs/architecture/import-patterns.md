
```markdown
<doc id="import-patterns">

# Import Patterns

<section id="barrel-files">

## Barrel Files

Barrel files (index.ts/js files) consolidate and re-export components or modules from a directory, simplifying imports throughout the application.

```typescript
// Example barrel file: src/components/core/index.ts
export * from './Button';
export * from './Input';
export * from './Text';
export * from './Card';
This allows consumers to import from the directory instead of specific files:
typescript// Without barrel files
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/Input';

// With barrel files
import { Button, Input } from '@/components/core';
```
Benefits of barrel files:

Simplified imports
Cleaner code
Easier refactoring
Logical grouping of exports

[RULE] Create barrel files (index.ts) for directories with multiple related exports.
</section>
<section id="path-aliases">
Path Aliases
Path aliases provide shorthand references to commonly used directories, avoiding lengthy relative paths.
Our project uses the following path aliases:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
        // Base path
        "@/*": ["./src/*"],

        // Core component and hook paths
        "@components/*": ["./src/components/*"],
        "@hooks/*": ["./src/hooks/*"],

        // Server-side and data paths
        "@actions/*": ["./src/app/actions/*"],
        "@enums": ["./src/lib/schema/enum"],
        "@zod-schema/*": ["./src/lib/schema/zod-schema/*"],
        "@mongoose-schema/*": ["./src/lib/schema/mongoose-schema/*"],
        "@/lib/server/*": ["./src/lib/server/*"],
        "@/lib/transformers/*": ["./src/lib/transformers/*"],

        // Library and utility paths
        "@lib/*": ["./src/lib/*"],
        "@utils/*": ["./src/lib/utils/*"],
        "@styles/*": ["./src/styles/*"],
        "@core/*": ["./src/lib/core/*"],
        "@domain/*": ["./src/lib/domain/*"],
        "@api/*": ["./src/lib/api/*"],
        "@error/*": ["./src/lib/error/*"],

        // UI-specific paths
        "@ui/*": ["./src/lib/ui/*"],
        "@ui-tokens/*": ["./src/lib/ui/tokens/*"],
        "@ui-variants/*": ["./src/lib/ui/variants/*"],
        "@ui-forms/*": ["./src/lib/ui/forms/*"],
        
        // Type paths
        "@core-types/*": ["./src/lib/types/core/*"],
        "@domain-types/*": ["./src/lib/types/domain/*"],
        "@ui-types/*": ["./src/lib/types/ui/*"],

        
        // Testing utilities
        "@testing/*": ["./src/lib/testing/*"],
        "@mocks/*": ["./src/lib/dev/mocks/*"]
    },
  }
}
```
Example usage:

```typescript
// Avoid relative paths
import { Button } from '../../../components/core/Button';

// Use path aliases instead
import { Button } from '@components/core/Button';
// or 
import { Button } from '@/components/core/Button';
```

Benefits of path aliases:

Shorter, more readable imports
Avoids complex relative paths
Makes refactoring easier
Improves code maintainability

[RULE] Always use path aliases instead of deeply nested relative imports.
</section>
<section id="import-organization">
Import Organization
Keep imports organized in a consistent order:

External libraries
Path aliases
Relative imports

```typescript
// Example of organized imports
import { useState, useEffect } from 'react';
import { z } from 'zod';

import { Button } from '@/components/core';
import { useSchools } from '@/hooks/useSchools';
import { SchoolZodSchema } from '@/lib/schema/zod-schema';

import { renderField } from './utils';
import styles from './styles.module.css';
```
Additionally:

Group imports logically
Leave a blank line between groups
Alphabetize imports within groups (optional)
Use destructuring when appropriate

[RULE] Group and order imports consistently in every file.
</section>

<section id="import-best-practices">
Import Best Practices
Import Only What You Need

```typescript
// ❌ Bad - imports entire library
import * as React from 'react';

// ✅ Good - imports only what's needed
import { useState, useEffect } from 'react';
```

Use Consistent Import Style
Choose either named imports or default imports consistently:

```typescript
// Named imports (preferred for most libraries)
import { Button, Input } from '@/components/core';

// Default imports (when appropriate)
import Button from '@/components/core/Button';
```
Handle Dynamic Imports
For code splitting and lazy loading:

```typescript
// Lazy load component
const DynamicComponent = React.lazy(() => import('@/components/heavy-component'));

// Dynamic import in server action
const csv = await import('csv-parser');
```

[RULE] Follow import best practices for cleaner, more maintainable code.
</section>

<section id="domain-hook-imports">

## Domain Hook Import Patterns

Our domain hooks are now organized by business domain with specific import patterns for optimal developer experience.

### Recommended Import Patterns

Use barrel imports for most cases:

```typescript
// ✅ Preferred: Import from domain barrel
import { useNYCPSStaff, useBellSchedules, useSchools } from '@/hooks/domain';

// ✅ Alternative: Import from top-level hooks barrel
import { useNYCPSStaff, useBellSchedules, useSchools } from '@/hooks';
```

### Direct Import for Specific Hooks

For performance-critical code or when you need only one hook:

```typescript
// ✅ Direct import for single hook from staff subdirectory
import { useNYCPSStaff } from '@/hooks/domain/staff/useNYCPSStaff';
import { useTeachingLabStaff } from '@/hooks/domain/staff/useTeachingLabStaff';
import { useUserStaff } from '@/hooks/domain/staff/useUserStaff';

// ✅ Direct import from schedule subdirectory
import { useBellSchedules } from '@/hooks/domain/schedule/useBellSchedules';
import { useTeacherSchedules } from '@/hooks/domain/schedule/useTeacherSchedules';

// ✅ Direct import for core entity hooks (root level)
import { useSchools } from '@/hooks/domain/useSchools';
import { useLookFors } from '@/hooks/domain/useLookFors';
import { useVisits } from '@/hooks/domain/useVisits';
import { useSchoolDailyView } from '@/hooks/domain/useSchoolDailyView';
```

### Domain-Specific Imports

When working within a specific domain, import from the subdirectory barrel:

```typescript
// In staff-related components - import from staff subdirectory
import { 
  useNYCPSStaff, 
  useTeachingLabStaff, 
  useUserStaff 
} from '@/hooks/domain/staff';

// In schedule-related components - import from schedule subdirectory
import { 
  useBellSchedules, 
  useTeacherSchedules 
} from '@/hooks/domain/schedule';

// For core entity hooks - import from domain root
import { 
  useSchools, 
  useLookFors, 
  useVisits,
  useSchoolDailyView
} from '@/hooks/domain';
```

### TypeScript Path Resolution

Our path aliases support the new structure:

```typescript
// All of these work with our tsconfig.json
import { useNYCPSStaff } from '@/hooks/domain';
import { useNYCPSStaff } from '@hooks/domain';
import { useNYCPSStaff } from '@/hooks/domain/staff/useNYCPSStaff';
```

### Import Organization Guidelines

Organize imports by domain grouping:

```typescript
// External libraries
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Domain hooks grouped by area
import { useSchools, useLookFors } from '@/hooks/domain';
import { useNYCPSStaff, useTeachingLabStaff } from '@/hooks/domain/staff';
import { useBellSchedules } from '@/hooks/domain/schedule';

// UI and utility hooks
import { usePagination } from '@/hooks/ui';
import { useErrorHandledMutation } from '@/hooks/error';

// Local imports
import { StaffCard } from './StaffCard';
```

[RULE] Use barrel imports for most cases and organize imports by domain grouping for better readability.

</section>
<section id="avoiding-circular-dependencies">
Avoiding Circular Dependencies
Circular dependencies occur when two or more modules depend on each other:

```typescript
// fileA.ts
import { functionB } from './fileB';
export function functionA() {
  return functionB();
}

// fileB.ts 
import { functionA } from './fileA';
export function functionB() {
  return functionA(); // Circular dependency!
}
```
To avoid circular dependencies:

Refactor Common Logic: Extract shared functionality to a separate module
Use Interface Segregation: Split interfaces to avoid unnecessary dependencies
Apply Dependency Injection: Pass dependencies as arguments rather than importing
Create Hub Modules: Use intermediate modules that import from both modules

[RULE] Actively refactor to avoid circular dependencies in your import structure.
</section>
</doc>
```
