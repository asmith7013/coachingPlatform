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

## Import Examples

The new structure allows for cleaner imports:

```typescript
// Instead of:
import { SchoolZodSchema } from '@/lib/zod-schema/core/school';
import { SchoolFieldConfig } from '@/lib/ui-schema/fieldConfig/core/school';

// You can now use:
import { SchoolZodSchema } from '@/lib/data/schemas';
import { SchoolFieldConfig } from '@/lib/data/forms';
```

This reorganization improves developer experience by:
1. Creating a more intuitive structure
2. Aligning related functionality
3. Reducing import complexity
4. Simplifying future extensions

## Migrating from the old structure

If you need to update import paths across your codebase, run:

```bash
./scripts/update-imports.sh
```

This script will create a backup and update all import paths to match the new structure. 