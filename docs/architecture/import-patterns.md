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
        "@enums": ["./src/lib/data-schema/enum"],
        "@zod-schema/*": ["./src/lib/data-schema/zod-schema/*"],
        "@mongoose-schema/*": ["./src/lib/data-schema/mongoose-schema/*"],
        "@data-server/*": ["./src/lib/data-server/*"],
        "@data-utilities/*": ["./src/lib/data-utilities/*"],

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
import { SchoolZodSchema } from '@/lib/zod-schema';

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
