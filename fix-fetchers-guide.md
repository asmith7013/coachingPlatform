# Fix API-Safe Fetchers Type Issues

## SCOPE
- IN SCOPE: Fix TypeScript type issues in staff.ts and schedule.ts fetchers
- OUT OF SCOPE: Changing the overall fetcher architecture

## ROOT CAUSE
The `createApiSafeFetcher` factory was overly constraining types to `BaseDocument`, preventing full entity types from flowing through.

## IMPLEMENTATION

### 1. Update fetcher-factory.ts

Remove the overly restrictive generic constraint:

```typescript
// src/lib/server/fetchers/fetcher-factory.ts
export function createApiSafeFetcher<M extends Document>(
  model: Model<M>,
  defaultSearchField?: string
) {
  return async function(params: QueryParams) {
    // ... existing implementation
    
    // Let Mongoose transforms handle the type conversion
    const processedItems = sanitizeDocuments(items);
    
    return {
      items: processedItems,
      total,
      success: true,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: (page * limit) < total
    };
  };
}
```

### 2. Update staff.ts fetcher

Add proper type assertions for the unified fetcher:

```typescript
// src/lib/server/fetchers/domain/staff.ts
import { NYCPSStaffModel, TeachingLabStaffModel } from '@mongoose-schema/core/staff.model';
import { NYCPSStaff, TeachingLabStaff } from '@zod-schema/core/staff';
import { createApiSafeFetcher } from '@/lib/server/fetchers/fetcher-factory';
import { fetchById } from '@/lib/server/fetchers/fetch-by-id';
import type { QueryParams } from '@core-types/query';
import type { CollectionResponse } from '@core-types/response';

/**
 * API-safe fetcher for NYCPS staff
 */
export const fetchNYCPSStaffForApi = createApiSafeFetcher(
  NYCPSStaffModel,
  "staffName"
) as (params: QueryParams) => Promise<CollectionResponse<NYCPSStaff>>;

/**
 * API-safe fetcher for Teaching Lab staff
 */
export const fetchTeachingLabStaffForApi = createApiSafeFetcher(
  TeachingLabStaffModel,
  "staffName"
) as (params: QueryParams) => Promise<CollectionResponse<TeachingLabStaff>>;

/**
 * Fetches NYCPS staff by ID - using centralized utility
 */
export async function fetchNYCPSStaffByIdForApi(id: string) {
  return fetchById(NYCPSStaffModel, id, "NYCPS staff");
}

/**
 * Fetches Teaching Lab staff by ID - using centralized utility
 */
export async function fetchTeachingLabStaffByIdForApi(id: string) {
  return fetchById(TeachingLabStaffModel, id, "Teaching Lab staff");
}

/**
 * Checks if a staff member exists by email
 */
export async function checkStaffExistenceByEmailForApi(email: string) {
  try {
    if (!email) {
      return {
        success: false,
        items: [],
        exists: false,
        error: "Email is required"
      };
    }
    
    const nycpsStaff = await NYCPSStaffModel.findOne({ email });
    const tlStaff = await TeachingLabStaffModel.findOne({ email });
    
    const exists = !!nycpsStaff || !!tlStaff;
    
    return {
      success: true,
      items: [],
      exists,
      total: exists ? 1 : 0
    };
  } catch (error) {
    console.error(`Error checking staff existence:`, error);
    return {
      success: false,
      items: [],
      exists: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Unified staff fetcher that handles type parameter
 */
export async function fetchStaffForApi(params: QueryParams): Promise<CollectionResponse<NYCPSStaff | TeachingLabStaff>> {
  const { type, ...otherParams } = params;
  
  switch (type) {
    case 'nycps':
      return fetchNYCPSStaffForApi(otherParams);
      
    case 'teachingLab':
      return fetchTeachingLabStaffForApi(otherParams);
      
    default: {
      // Fetch both and combine
      const [nycpsResult, tlResult] = await Promise.all([
        fetchNYCPSStaffForApi(otherParams),
        fetchTeachingLabStaffForApi(otherParams)
      ]);
      
      return {
        success: true,
        items: [...nycpsResult.items, ...tlResult.items],
        total: (nycpsResult.total || 0) + (tlResult.total || 0)
      };
    }
  }
}
```

### 3. Update schedule.ts fetcher

Apply the same type assertion pattern:

```typescript
// src/lib/server/fetchers/domain/schedule.ts
import { TeacherScheduleModel, BellScheduleModel } from '@mongoose-schema/schedule/schedule.model';
import { createApiSafeFetcher } from '@/lib/server/fetchers/fetcher-factory';
import type { QueryParams } from '@core-types/query';
import type { CollectionResponse } from '@core-types/response';
import { TeacherSchedule, BellSchedule } from '@zod-schema/schedule/schedule';

/**
 * API-safe fetcher for teacher schedules
 */
export const fetchTeacherSchedulesForApi = createApiSafeFetcher(
  TeacherScheduleModel,
  "teacher"
) as (params: QueryParams) => Promise<CollectionResponse<TeacherSchedule>>;

/**
 * API-safe fetcher for bell schedules
 */
export const fetchBellSchedulesForApi = createApiSafeFetcher(
  BellScheduleModel,
  "school"
) as (params: QueryParams) => Promise<CollectionResponse<BellSchedule>>;

/**
 * Unified schedule fetcher that handles type parameter
 */
export async function fetchSchedulesForApi(params: QueryParams): Promise<CollectionResponse<TeacherSchedule | BellSchedule>> {
  const { type, ...otherParams } = params;
  
  switch (type) {
    case 'teacher':
      return fetchTeacherSchedulesForApi(otherParams);
    case 'bell':
      return fetchBellSchedulesForApi(otherParams);
    default: {
      const [teacherData, bellData] = await Promise.all([
        fetchTeacherSchedulesForApi(otherParams),
        fetchBellSchedulesForApi(otherParams)
      ]);
      return {
        success: true,
        items: [...(teacherData.items || []), ...(bellData.items || [])],
        total: (teacherData.total || 0) + (bellData.total || 0)
      };
    }
  }
}
```

## KEY INSIGHTS

1. **Mongoose Transforms Work**: The models already have `standardMongooseTransform` that converts ObjectIds to strings
2. **Type Assertions for Generic Functions**: When using generic factories, we need type assertions to maintain specific entity types
3. **Let Runtime Handle Conversion**: Don't over-engineer the type system - let Mongoose do the heavy lifting

## VERIFICATION

After these changes:
- ✅ TypeScript errors should resolve
- ✅ Fetchers return correct entity types
- ✅ Existing working fetchers remain unchanged
- ✅ Runtime behavior is identical
