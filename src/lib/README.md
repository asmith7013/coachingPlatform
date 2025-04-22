# Library Structure

This directory contains the core libraries and utilities used throughout the application. The structure is organized to reflect the natural separation of concerns:

## Main Directories

### `/core` - Essential app functionality
- `db.ts` - Database connection
- `api.ts` - API utilities
- `/error` - Error handling

### `/data` - Data management
- `/schemas` - Zod schemas (previously zod-schema)
- `/forms` - Form configurations (previously ui-schema)
- `/hooks` - Data fetching hooks
- `/server-actions` - Server-side actions

### `/ui` - UI utilities
- `/tokens` - Design tokens
- `/variants` - Tailwind variants
- `/helpers` - UI helper functions

### `/utils` - General utilities
- `/dev` - Development utilities
- `/server` - Server utilities
- `/general` - General utilities

### `/domains` - Domain-specific functionality
- `/imRoutine` - imRoutine domain logic
- `/assessment` - Assessment domain logic (future)

## Import Examples

The new structure allows for cleaner imports using path aliases:

```typescript
// Instead of deeply nested imports:
import { SchoolZodSchema } from '@/lib/zod-schema/core/school';
import { SchoolFieldConfig } from '@/lib/ui-schema/fieldConfig/core/school';
import { cn } from '@/lib/utils';

// You can now use namespaced imports:
import { schemas } from '@/lib'; // Access through namespaces
const { SchoolZodSchema } = schemas.core.school;

// Or for commonly used utilities, direct imports:
import { cn } from '@/lib';
import { School, SchoolInput } from '@/lib';

// Domain-specific imports:
import { getUnitURL } from '@/lib/domains/imRoutine';
```

## Path Aliases

We've defined the following path aliases for cleaner imports:

```json
{
  "@/*": ["./src/*"],
  "@components/*": ["./src/components/*"],
  "@hooks/*": ["./src/hooks/*"],
  "@lib/*": ["./src/lib/*"],
  "@lib/core/*": ["./src/lib/core/*"],
  "@lib/data/*": ["./src/lib/data/*"],
  "@lib/ui/*": ["./src/lib/ui/*"],
  "@lib/utils/*": ["./src/lib/utils/*"],
  "@lib/domains/*": ["./src/lib/domains/*"]
}
```

## Migrating from the old structure

If you need to update import paths across your codebase, run:

```bash
./scripts/update-imports.sh
```

This script will create a backup and update all import paths to match the new structure.

## Troubleshooting Common Import Issues

### UI Token Imports

If you experience conflicts with UI token imports, use the namespace approach:

```typescript
// Instead of:
import { textSize, heading, paddingY } from '@/lib/ui';

// Use:
import { ui } from '@/lib';
const { textSize, heading, paddingY } = ui.tokens;
```

### Mixed Schema & Form Imports

When working with both schemas and form configurations:

```typescript
import { data } from '@/lib';
const { SchoolZodSchema } = data.schemas;
const { SchoolFieldConfig } = data.forms;
```

### Utility Functions

Use the direct exports for common utilities:

```typescript
import { cn } from '@/lib';
```

Or for specific utilities:

```typescript
import { utils } from '@/lib';
const { standardizeResponse } = utils.server;
``` 