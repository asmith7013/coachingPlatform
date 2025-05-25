// src/query/client/selectors/reference-selectors.ts

import { z } from "zod";
import { BaseDocument } from "@core-types/document";
import { EntitySelector } from "./selector-types";
import { getSelector, registerSelector } from "./selector-registry";
import { queryKeys } from "@query/core/keys";
import { handleClientError } from "@error/handlers/client";

// Base reference schema and type
export const BaseReferenceZodSchema = z.object({
  _id: z.string(),
  label: z.string(),
  value: z.string().optional(),
});

export type BaseReference = z.infer<typeof BaseReferenceZodSchema>;

/**
 * Enhanced selector factory extension for references
 * Extends an existing selector with reference capabilities
 */
export function enhanceWithReferenceSelector<
  T extends BaseDocument,
  R extends BaseReference = BaseReference
>(
  selector: EntitySelector<T>,
  getLabelFn: (entity: T) => string,
  getAdditionalFields?: (entity: T) => Partial<Omit<R, '_id' | 'label' | 'value'>>
): EntitySelector<T> & { 
  enhancedReference: (data: unknown) => R[] 
} {
  // Create reference transformation function
  const referenceTransformer = (items: T[]): R[] => {
    return items.map(item => {
      const reference: BaseReference = {
        _id: item._id,
        label: getLabelFn(item),
        value: item._id,
      };
      
      return {
        ...reference,
        ...(getAdditionalFields ? getAdditionalFields(item) : {}),
      } as R;
    });
  };
  
  // Create enhanced reference selector function
  const enhancedReference = (data: unknown): R[] => {
    try {
      // Use the existing basic selector to get the transformed items
      const items = selector.basic(data);
      // Apply the reference transformation
      return referenceTransformer(items);
    } catch (error) {
      handleClientError(error, 'enhancedReference');
      return [];
    }
  };
  
  // Return the enhanced selector
  return {
    ...selector,
    enhancedReference
  };
}

/**
 * Registers a reference selector for an entity type
 */
export function registerReferenceSelector<
  T extends BaseDocument,
  R extends BaseReference = BaseReference
>(
  entityType: string,
  getLabelFn: (entity: T) => string,
  getAdditionalFields?: (entity: T) => Partial<Omit<R, '_id' | 'label' | 'value'>>
): (data: unknown) => R[] {
  // Get or create the selector for this entity type
  const selector = getSelector<T>(entityType);
  
  // Create the enhanced selector
  const enhanced = enhanceWithReferenceSelector<T, R>(
    selector,
    getLabelFn,
    getAdditionalFields
  );
  
  // Return the enhanced reference function
  return enhanced.enhancedReference;
}

// Define entity-specific reference interfaces
export interface SchoolReference extends BaseReference {
  schoolNumber?: string;
  district?: string;
}

export interface StaffReference extends BaseReference {
  email?: string;
  role?: string;
}

export interface ScheduleReference extends BaseReference {
  teacher?: string;
  school?: string;
}

export interface BellScheduleReference extends BaseReference {
  school?: string;
  bellScheduleType?: string;
}

export interface LookForReference extends BaseReference {
  lookForIndex?: number;
}

export interface VisitReference extends BaseReference {
  date?: string;
  school?: string;
}

export interface CoachingLogReference extends BaseReference {
  solvesTouchpoint?: string;
}

// Pre-configure common reference transformers
export const referenceSelectors = {
  school: registerReferenceSelector<any, SchoolReference>(
    'schools',
    (school) => school.schoolName,
    (school) => ({
      schoolNumber: school.schoolNumber,
      district: school.district
    })
  ),
  
  staff: registerReferenceSelector<any, StaffReference>(
    'nycps-staff',
    (staff) => staff.staffName,
    (staff) => ({
      email: staff.email,
      role: staff.rolesNYCPS?.[0]
    })
  ),
  
  teachingLabStaff: registerReferenceSelector<any, StaffReference>(
    'teaching-lab-staff',
    (staff) => staff.staffName,
    (staff) => ({
      email: staff.email,
      role: staff.rolesTL?.[0]
    })
  ),
  
  visit: registerReferenceSelector<any, VisitReference>(
    'visits',
    (visit) => `Visit: ${visit.date}`,
    (visit) => ({
      date: visit.date,
      school: visit.school
    })
  ),
  
  lookFor: registerReferenceSelector<any, LookForReference>(
    'look-fors',
    (lookFor) => lookFor.topic,
    (lookFor) => ({
      lookForIndex: lookFor.lookForIndex
    })
  ),
  
  coachingLog: registerReferenceSelector<any, CoachingLogReference>(
    'coaching-logs',
    (log) => log.primaryStrategy,
    (log) => ({
      solvesTouchpoint: log.solvesTouchpoint
    })
  )
};

// Legacy compatibility functions to bridge with existing code
// These maintain backward compatibility with your existing reference-mappers.ts
export function mapSchoolToReference(school: any): SchoolReference {
  return {
    _id: school._id,
    label: school.schoolName,
    value: school._id,
    schoolNumber: school.schoolNumber,
    district: school.district
  };
}

export function mapStaffToReference(staff: any): StaffReference {
  return {
    _id: staff._id,
    label: staff.staffName,
    value: staff._id,
    email: staff.email,
    role: staff.rolesNYCPS?.[0] || staff.rolesTL?.[0]
  };
}

// Export legacy reference mappers for backward compatibility
export const referenceMappers = {
  school: mapSchoolToReference,
  staff: mapStaffToReference,
  // Map the rest directly to the new selectors
  schedule: (data: any) => referenceSelectors.school([data])[0],
  bellSchedule: (data: any) => referenceSelectors.school([data])[0],
  lookFor: (data: any) => referenceSelectors.lookFor([data])[0],
  visit: (data: any) => referenceSelectors.visit([data])[0],
  coachingLog: (data: any) => referenceSelectors.coachingLog([data])[0]
};













// src/lib/api/handlers/reference/enhanced-endpoint-factory.ts

import { NextRequest, NextResponse } from "next/server";
import { withQueryValidation } from "@/lib/api/validation/integrated-validation";
import { createMonitoredErrorResponse } from "@api-responses/action-response-helper";
import { createCollectionResponse } from "@api-responses/formatters";
import { z } from "zod";
import { BaseReference } from "@query/client/selectors/reference-selectors";
import { QueryParamsZodSchema } from "@zod-schema/core-types/query";

// Query parameters for reference endpoints
export const ReferenceQueryParamsZodSchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().optional().default(100),
  page: z.coerce.number().optional().default(1),
  filters: z.record(z.string()).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type ReferenceQueryParams = z.infer<typeof ReferenceQueryParamsZodSchema>;

// Options for creating a reference endpoint
export interface ReferenceEndpointOptions<T extends BaseReference = BaseReference> {
  // The function to fetch data (can be API-safe fetcher)
  fetchFunction: (params: any) => Promise<any>;
  
  // The reference transformer function to use
  referenceSelector: (data: unknown) => T[];
  
  // Optional field to search by (default is 'label')
  defaultSearchField?: string;
  
  // Optional prefix for logs
  logPrefix?: string;
}

/**
 * Creates a reference endpoint handler with the enhanced reference system
 * This integrates with your existing API handlers structure
 */
export function createEnhancedReferenceEndpoint<T extends BaseReference = BaseReference>(
  options: ReferenceEndpointOptions<T>
) {
  const {
    fetchFunction,
    referenceSelector,
    defaultSearchField = 'label',
    logPrefix = 'ReferenceEndpoint'
  } = options;

  return withQueryValidation(
    ReferenceQueryParamsZodSchema,
    async (params: ReferenceQueryParams, req: NextRequest) => {
      try {
        const endpoint = req.url.split("?")[0].split("/api/")[1];
        const component = `${logPrefix}/${endpoint}`;
        
        // Build fetch parameters
        const fetchParams = {
          limit: params.limit,
          page: params.page,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
          ...(params.search ? { search: params.search, searchFields: [defaultSearchField] } : {}),
          ...(params.filters || {})
        };

        console.log(`📥 ${logPrefix}: Fetching reference data:`, {
          endpoint,
          search: params.search,
          limit: params.limit
        });

        // Fetch the data
        const response = await fetchFunction(fetchParams);
        
        // Transform to reference format using the selector
        const referenceItems = referenceSelector(response);
        
        console.log(`📤 ${logPrefix}: Returning ${referenceItems.length} reference items`);
        
        // Create response
        return NextResponse.json(
          createCollectionResponse(
            referenceItems,
            `${logPrefix}: Successfully fetched reference data`
          )
        );
      } catch (error) {
        console.error(`${logPrefix}: Error fetching reference data:`, error);
        return NextResponse.json(
          createMonitoredErrorResponse(
            error, 
            { component: logPrefix, operation: 'fetchReferenceData' }
          ),
          { status: 500 }
        );
      }
    }
  );
}

/**
 * Usage example:
 * 
 * ```typescript
 * // src/app/api/reference/schools/route.ts
 * import { createEnhancedReferenceEndpoint } from "@/lib/api/handlers/reference/enhanced-endpoint-factory";
 * import { referenceSelectors } from "@query/client/selectors/reference-selectors";
 * import { fetchSchoolsForApi } from "@/lib/api/fetchers/school";
 * 
 * export const GET = createEnhancedReferenceEndpoint({
 *   fetchFunction: fetchSchoolsForApi,
 *   referenceSelector: referenceSelectors.school,
 *   defaultSearchField: "schoolName",
 *   logPrefix: "SchoolsAPI"
 * });
 * ```
 */










// src/query/client/hooks/data/useReferenceData.ts

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useMemo } from 'react';
import { queryKeys } from '@query/core/keys';
import { BaseReference } from '@query/client/selectors/reference-selectors';
import { handleClientError } from '@error/handlers/client';

// Define options interface
export interface ReferenceDataOptions<T extends BaseReference = BaseReference> {
  // API endpoint URL to fetch reference data
  url: string;
  
  // Optional search query
  searchQuery?: string;
  
  // Optional additional filters
  filters?: Record<string, string>;
  
  // Optional limit
  limit?: number;
  
  // Optional data selector/transformer
  selector: (data: unknown) => T[];
  
  // Optional error context for error handling
  errorContext?: string;
  
  // Whether to disable automatic fetching
  disabled?: boolean;
  
  // Additional query options
  queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn' | 'enabled' | 'select'>;
}

/**
 * Enhanced hook for fetching and managing reference data with React Query
 */
export function useReferenceData<T extends BaseReference = BaseReference>(
  options: ReferenceDataOptions<T>
) {
  const {
    url,
    searchQuery = '',
    filters = {},
    limit,
    selector,
    errorContext = 'useReferenceData',
    disabled = false,
    queryOptions = {}
  } = options;
  
  // Build query URL with parameters
  const queryUrl = useMemo(() => {
    if (disabled) return null;
    
    try {
      const searchParams = new URLSearchParams();
      
      // Add search parameter if provided
      if (searchQuery) {
        searchParams.append('search', searchQuery);
      }
      
      // Add filters
      for (const [key, value] of Object.entries(filters)) {
        if (value) {
          searchParams.append(key, value);
        }
      }
      
      // Add limit if provided
      if (limit) {
        searchParams.append('limit', String(limit));
      }
      
      // Build final URL
      const query = searchParams.toString();
      return query ? `${url}?${query}` : url;
    } catch (error) {
      handleClientError(error, `${errorContext}:buildQueryUrl`);
      return url; // Fall back to base URL
    }
  }, [url, searchQuery, filters, limit, disabled]);
  
  // Create the query key
  const queryKey = queryKeys.references.options(url, searchQuery, filters);
  
  // Fetch data using React Query
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!queryUrl) return { items: [], total: 0, success: false };
      
      try {
        const response = await fetch(queryUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch reference data: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error(handleClientError(error, `${errorContext}:fetchData`));
      }
    },
    select: (data) => {
      try {
        return {
          // Apply selector for reference transformation
          options: selector(data) as T[],
          // Preserve metadata from the response
          pagination: {
            total: data.total || 0,
            page: data.page || 1,
            limit: data.limit || 20,
            totalPages: data.totalPages || 1
          },
          // Original data for custom needs
          rawData: data
        };
      } catch (error) {
        handleClientError(error, `${errorContext}:processData`);
        return {
          options: [] as T[],
          pagination: {
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0
          },
          rawData: data
        };
      }
    },
    enabled: !disabled && !!queryUrl,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...queryOptions
  });
  
  // Return the processed data and metadata
  return { 
    options: query.data?.options || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    rawData: query.data?.rawData
  };
}

/**
 * Implementation using the new reference system with simplified API
 */
export function useEnhancedReferenceOptions<T extends BaseReference = BaseReference>(
  url: string,
  selector: (data: unknown) => T[],
  searchQuery: string = '',
  filters: Record<string, string> = {}
) {
  const { options, isLoading, error } = useReferenceData<T>({
    url,
    searchQuery,
    filters,
    selector,
    errorContext: 'useEnhancedReferenceOptions'
  });
  
  return { options, isLoading, error };
}

/**
 * Usage example:
 * 
 * ```typescript
 * import { useEnhancedReferenceOptions } from '@query/client/hooks/data/useReferenceData';
 * import { referenceSelectors, SchoolReference } from '@query/client/selectors/reference-selectors';
 * 
 * // In your component:
 * const { options, isLoading } = useEnhancedReferenceOptions<SchoolReference>(
 *   '/api/reference/schools',
 *   referenceSelectors.school,
 *   searchQuery,
 *   { district: selectedDistrict }
 * );
 * ```
 */













 // src/components/core/fields/EnhancedReferenceSelect.tsx

import { useState, useEffect, useMemo } from 'react';
import { Select } from '@/components/core/fields/Select';
import { useEnhancedReferenceOptions } from '@query/client/hooks/data/useReferenceData';
import { BaseReference } from '@query/client/selectors/reference-selectors';
import { FieldWrapper } from '@/components/core/fields/FieldWrapper';
import { cn } from '@ui/utils/formatters';

// Define component props
export interface EnhancedReferenceSelectProps<T extends BaseReference = BaseReference> {
  // Common select props
  name: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  className?: string;
  
  // Reference specific props
  url: string;
  selector: (data: unknown) => T[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  
  // Filtering props
  searchable?: boolean;
  filters?: Record<string, string>;
  
  // Optional custom rendering
  renderOption?: (option: T) => React.ReactNode;
  renderValue?: (value: string, options: T[]) => React.ReactNode;
}

/**
 * Enhanced reference select component that uses the reference system with React Query
 */
export function EnhancedReferenceSelect<T extends BaseReference = BaseReference>({
  name,
  label,
  placeholder = 'Select...',
  helperText,
  error,
  required = false,
  disabled = false,
  multiple = false,
  className,
  url,
  selector,
  value,
  onChange,
  searchable = true,
  filters = {},
  renderOption,
  renderValue
}: EnhancedReferenceSelectProps<T>) {
  // Local search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch reference options using the enhanced hook
  const { options, isLoading } = useEnhancedReferenceOptions<T>(
    url,
    selector,
    searchQuery,
    filters
  );
  
  // Format options for the select component
  const selectOptions = useMemo(() => {
    return options.map((option) => ({
      value: option._id,
      label: option.label,
      data: option,
    }));
  }, [options]);
  
  // Handle search input
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  // Handle value change
  const handleChange = (newValue: string | string[]) => {
    if (onChange) {
      onChange(newValue);
    }
  };
  
  // Optional custom renderers
  const customRenderOption = renderOption
    ? (optionValue: string, optionLabel: string) => {
        const option = options.find(opt => opt._id === optionValue);
        if (!option) return optionLabel;
        return renderOption(option);
      }
    : undefined;
  
  const customRenderValue = renderValue
    ? (selectedValue: string) => {
        return renderValue(selectedValue, options);
      }
    : undefined;
  
  return (
    <FieldWrapper
      name={name}
      label={label}
      required={required}
      helperText={helperText}
      error={error}
    >
      <Select
        name={name}
        options={selectOptions}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        isLoading={isLoading}
        disabled={disabled}
        multiple={multiple}
        searchable={searchable}
        onSearch={handleSearch}
        renderOption={customRenderOption}
        renderValue={customRenderValue}
        className={cn("w-full", className)}
      />
    </FieldWrapper>
  );
}

/**
 * Import common dependencies to expose in this file
 */
import { referenceSelectors } from '@query/client/selectors/reference-selectors';

/**
 * Entity-specific reference select components for convenient usage
 */

// SchoolReferenceSelect
export function SchoolReferenceSelect(props: Omit<EnhancedReferenceSelectProps, 'url' | 'selector'>) {
  return (
    <EnhancedReferenceSelect
      url="/api/reference/schools"
      selector={referenceSelectors.school}
      {...props}
    />
  );
}

// StaffReferenceSelect
export function StaffReferenceSelect(props: Omit<EnhancedReferenceSelectProps, 'url' | 'selector'>) {
  return (
    <EnhancedReferenceSelect
      url="/api/reference/staff"
      selector={referenceSelectors.staff}
      {...props}
    />
  );
}

// LookForReferenceSelect
export function LookForReferenceSelect(props: Omit<EnhancedReferenceSelectProps, 'url' | 'selector'>) {
  return (
    <EnhancedReferenceSelect
      url="/api/reference/look-fors"
      selector={referenceSelectors.lookFor}
      {...props}
    />
  );
}

// Export common entity-specific select components for convenience
export const ReferenceSelects = {
  School: SchoolReferenceSelect,
  Staff: StaffReferenceSelect,
  LookFor: LookForReferenceSelect,
  // Can add more specialized selects as needed
};

/**
 * Usage example:
 * 
 * ```tsx
 * import { EnhancedReferenceSelect } from '@/components/core/fields/EnhancedReferenceSelect';
 * import { referenceSelectors, SchoolReference } from '@query/client/selectors/reference-selectors';
 * 
 * // In your component:
 * <EnhancedReferenceSelect<SchoolReference>
 *   name="school"
 *   label="School"
 *   url="/api/reference/schools"
 *   selector={referenceSelectors.school}
 *   value={selectedSchool}
 *   onChange={setSelectedSchool}
 *   filters={{ district: selectedDistrict }}
 *   renderOption={(option) => (
 *     <div>
 *       <div className="font-medium">{option.label}</div>
 *       <div className="text-sm text-gray-500">{option.district}</div>
 *     </div>
 *   )}
 * />
 * ```
 */








// src/app/api/reference/schools/route.ts
import { createEnhancedReferenceEndpoint } from "@/lib/api/handlers/reference/enhanced-endpoint-factory";
import { referenceSelectors } from "@query/client/selectors/reference-selectors";
import { fetchSchoolsForApi } from "@/lib/api/fetchers/school";

/**
 * Endpoint for getting school reference data for select components
 * GET /api/reference/schools
 */
export const GET = createEnhancedReferenceEndpoint({
  fetchFunction: fetchSchoolsForApi,
  referenceSelector: referenceSelectors.school,
  defaultSearchField: "schoolName",
  logPrefix: "SchoolsAPI"
});

// src/app/api/reference/staff/route.ts
import { createEnhancedReferenceEndpoint } from "@/lib/api/handlers/reference/enhanced-endpoint-factory";
import { referenceSelectors } from "@query/client/selectors/reference-selectors";
import { fetchNYCPSStaffForApi } from "@/lib/api/fetchers/staff";

/**
 * Endpoint for getting staff reference data for select components
 * GET /api/reference/staff
 */
export const GET = createEnhancedReferenceEndpoint({
  fetchFunction: fetchNYCPSStaffForApi,
  referenceSelector: referenceSelectors.staff,
  defaultSearchField: "staffName",
  logPrefix: "StaffAPI"
});

// src/app/api/reference/teaching-lab-staff/route.ts
import { createEnhancedReferenceEndpoint } from "@/lib/api/handlers/reference/enhanced-endpoint-factory";
import { referenceSelectors } from "@query/client/selectors/reference-selectors";
import { fetchTLStaffForApi } from "@/lib/api/fetchers/staff";

/**
 * Endpoint for getting Teaching Lab staff reference data for select components
 * GET /api/reference/teaching-lab-staff
 */
export const GET = createEnhancedReferenceEndpoint({
  fetchFunction: fetchTLStaffForApi,
  referenceSelector: referenceSelectors.teachingLabStaff,
  defaultSearchField: "staffName",
  logPrefix: "TeachingLabStaffAPI"
});

// src/app/api/reference/look-fors/route.ts
import { createEnhancedReferenceEndpoint } from "@/lib/api/handlers/reference/enhanced-endpoint-factory";
import { referenceSelectors } from "@query/client/selectors/reference-selectors";
import { fetchLookForsForApi } from "@/lib/api/fetchers/lookFors";

/**
 * Endpoint for getting look-for reference data for select components
 * GET /api/reference/look-fors
 */
export const GET = createEnhancedReferenceEndpoint({
  fetchFunction: fetchLookForsForApi,
  referenceSelector: referenceSelectors.lookFor,
  defaultSearchField: "topic",
  logPrefix: "LookForsAPI"
});

// src/app/api/reference/visits/route.ts
import { createEnhancedReferenceEndpoint } from "@/lib/api/handlers/reference/enhanced-endpoint-factory";
import { referenceSelectors } from "@query/client/selectors/reference-selectors";
import { fetchVisitsForApi } from "@/lib/api/fetchers/visits";

/**
 * Endpoint for getting visit reference data for select components
 * GET /api/reference/visits
 */
export const GET = createEnhancedReferenceEndpoint({
  fetchFunction: fetchVisitsForApi,
  referenceSelector: referenceSelectors.visit,
  defaultSearchField: "date",
  logPrefix: "VisitsAPI"
});

// src/app/api/reference/coaching-logs/route.ts
import { createEnhancedReferenceEndpoint } from "@/lib/api/handlers/reference/enhanced-endpoint-factory";
import { referenceSelectors } from "@query/client/selectors/reference-selectors";
import { fetchCoachingLogsForApi } from "@/lib/api/fetchers/coachingLog";

/**
 * Endpoint for getting coaching-log reference data for select components
 * GET /api/reference/coaching-logs
 */
export const GET = createEnhancedReferenceEndpoint({
  fetchFunction: fetchCoachingLogsForApi,
  referenceSelector: referenceSelectors.coachingLog,
  defaultSearchField: "primaryStrategy",
  logPrefix: "CoachingLogsAPI"
});

// Example implementation showing how to customize the reference endpoint
// src/app/api/reference/schools-by-district/route.ts
import { withQueryValidation } from "@/lib/api/validation/integrated-validation";
import { createCollectionResponse } from "@api-responses/formatters";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Custom query schema with required district parameter
const SchoolsByDistrictQuerySchema = z.object({
  district: z.string(),
  search: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(50),
});

/**
 * Custom endpoint for school references filtered by district
 * GET /api/reference/schools-by-district?district=ny_d9
 */
export const GET = withQueryValidation(
  SchoolsByDistrictQuerySchema,
  async (params, req: NextRequest) => {
    try {
      // Use the district filter from the params
      const response = await fetchSchoolsForApi({
        ...params,
        filters: { district: params.district }
      });
      
      // Transform to reference format
      const referenceItems = referenceSelectors.school(response);
      
      // Return the response
      return NextResponse.json(
        createCollectionResponse(referenceItems)
      );
    } catch (error) {
      console.error("Error fetching schools by district:", error);
      return NextResponse.json(
        { success: false, items: [], error: "Failed to fetch schools by district" },
        { status: 500 }
      );
    }
  }
);










