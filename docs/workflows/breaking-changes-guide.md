<doc id="breaking-changes-guide">

# Breaking Changes Migration Guide

<section id="migration-overview">

## Overview

This guide helps migrate code that uses patterns that have changed in our recent architectural updates.

[RULE] Follow this migration guide to update code that uses deprecated patterns.

</section>

<section id="domain-hook-migration">

## Domain Hook Import Changes

### Old Pattern (Deprecated)

```typescript
// ❌ Old flat imports (still work but deprecated)
import { useNYCPSStaff } from '@/hooks/domain/useNYCPSStaff';
import { useTeachingLabStaff } from '@/hooks/domain/useTeachingLabStaff';
import { useBellSchedules } from '@/hooks/domain/useBellSchedules';
import { useTeacherSchedules } from '@/hooks/domain/useTeacherSchedules';
```

### New Pattern (Recommended)

```typescript
// ✅ New organized imports
import { useNYCPSStaff, useTeachingLabStaff } from '@/hooks/domain/staff';
import { useBellSchedules, useTeacherSchedules } from '@/hooks/domain/schedule';

// OR use barrel imports
import { 
  useNYCPSStaff, 
  useTeachingLabStaff,
  useBellSchedules, 
  useTeacherSchedules 
} from '@/hooks/domain';
```

### Migration Steps

1. **Update Imports**: Change from flat to domain-organized imports
2. **Update Path Aliases**: Use the new domain structure
3. **Test Functionality**: Ensure all hooks work as expected

</section>

<section id="planned-visit-removal">

## Planned Visit Schema Removal

### Removed Components

The following have been removed:

```typescript
// ❌ Removed files
- src/app/actions/visits/planned-visits.ts
- src/lib/schema/mongoose-schema/visits/planned-visit.model.ts
- src/lib/schema/zod-schema/visits/planned-visit.ts
- src/hooks/domain/usePlannedVisits.ts
```

### Migration to Standard Visits

Replace planned visits with standard visit workflow:

```typescript
// ❌ Old planned visit pattern
import { usePlannedVisits } from '@/hooks/domain/usePlannedVisits';

function ScheduleComponent() {
  const { plannedVisits, createPlannedVisit } = usePlannedVisits();
  
  const handleSchedule = async (visitData) => {
    await createPlannedVisit(visitData);
  };
}

// ✅ New visit pattern
import { useVisits } from '@/hooks/domain/useVisits';

function ScheduleComponent() {
  const { items: visits, createAsync } = useVisits();
  
  const handleSchedule = async (visitData) => {
    const visit = {
      ...visitData,
      // Standard visit fields
      date: new Date(visitData.scheduledDate),
      status: 'scheduled'
    };
    
    await createAsync(visit);
  };
}
```

</section>

<section id="entity-factory-migration">

## Entity Factory to CRUD Factory Migration

### Old Pattern (Removed)

```typescript
// ❌ Old entity factory (removed)
import { createEntityHooks } from '@query/client/factories/entity-factory';

const schoolHooks = createEntityHooks({
  entityType: 'schools',
  // Old configuration...
});
```

### New Pattern (Required)

```typescript
// ✅ New CRUD factory
import { createCrudHooks } from '@query/client/factories/crud-factory';

const schoolHooks = createCrudHooks({
  entityType: 'schools',
  schema: SchoolZodSchema,
  serverActions: {
    fetch: fetchSchools,
    fetchById: fetchSchoolById,
    create: createSchool,
    update: updateSchool,
    delete: deleteSchool
  },
  validSortFields: ['schoolName', 'district'],
  relatedEntityTypes: ['staff', 'visits']
});
```

### Configuration Changes

| Old Entity Factory | New CRUD Factory |
|-------------------|------------------|
| `entityType` | `entityType` (same) |
| `serverActions` | `serverActions` (same structure) |
| ❌ `defaultParams` | ✅ Use `validSortFields[0]` as default |
| ❌ `customConfig` | ✅ `relatedEntityTypes` for cache invalidation |
| ❌ Manual schema | ✅ `schema` required |

</section>

<section id="transformer-simplification">

## Server Action Factory Removal

### Removed Components

```typescript
// ❌ Removed files
- src/lib/transformers/factories/server-action-factory.ts
```

### Migration to Direct Actions

Replace factory-generated actions with direct server actions:

```typescript
// ❌ Old server action factory pattern
import { createServerActionFactory } from '@/lib/transformers/factories/server-action-factory';

const schoolActions = createServerActionFactory(SchoolModel, SchoolZodSchema);

// ✅ New direct server actions
import { 
  fetchSchools,
  createSchool,
  updateSchool,
  deleteSchool 
} from '@actions/schools/operations';

// Use directly in hooks
const schoolHooks = createCrudHooks({
  entityType: 'schools',
  serverActions: {
    fetch: fetchSchools,
    create: createSchool,
    update: updateSchool,
    delete: deleteSchool
  }
});
```

</section>

<section id="migration-checklist">

## Migration Checklist

Use this checklist to ensure complete migration:

### Domain Hook Updates
- [ ] Update all domain hook imports to use new organization
- [ ] Replace flat imports with domain-structured imports
- [ ] Update any direct hook references

### Planned Visit Removal
- [ ] Remove all references to planned visit schemas
- [ ] Replace planned visit logic with standard visit workflow
- [ ] Update any components using planned visits

### Factory Migration  
- [ ] Replace entity factory with CRUD factory
- [ ] Update configuration to new factory interface
- [ ] Remove any server action factory usage

### Testing
- [ ] Test all hook imports resolve correctly
- [ ] Verify CRUD operations work as expected
- [ ] Confirm no planned visit references remain
- [ ] Check that transformations work properly

</section>

</doc> 