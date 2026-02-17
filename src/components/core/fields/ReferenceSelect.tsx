"use client";

import React, { useMemo, useCallback, useState, useId, useEffect } from "react";
import Select from "react-select";
import { Label } from "./Label";
import {
  useReferenceData,
  getEntityTypeFromUrlUtil,
} from "@query/client/hooks/queries/useReferenceData";
import { ZodSchema } from "zod";
import { BaseDocument } from "@core-types/document";
import type { AnyFieldApi } from "@tanstack/react-form";

export type OptionType = {
  value: string;
  label: string;
  [key: string]: unknown;
};

export interface ReferenceSelectProps {
  /** Selected value(s) */
  value: string[] | string;

  /** Handler for value changes */
  onChange: (value: string[] | string) => void;

  /** Handler for blur events */
  onBlur?: () => void;

  /** Whether multiple selection is allowed */
  multiple?: boolean;

  /** Label for the input */
  label: string;

  /** URL to fetch options from */
  url: string;

  /** Whether the field is disabled */
  disabled?: boolean;

  /** Error state for styling */
  error?: boolean;

  /** Optional help text */
  helpText?: string;

  /** Placeholder text */
  placeholder?: string;

  /** Optional schema override */
  schema?: ZodSchema<BaseDocument>;

  /** Optional entity type override for selector system */
  entityType?: string;

  /** Optional search term */
  search?: string;

  /** Additional className for the container */
  className?: string;

  /** TanStack Form field API for advanced integration */
  fieldApi?: AnyFieldApi;
}

/**
 * A simplified controlled component for selecting references from API-sourced options
 * Integrates with TanStack Form through useFieldRenderer
 */
export function ReferenceSelect({
  value,
  onChange,
  onBlur,
  multiple = false,
  label,
  url,
  disabled = false,
  error = false,
  helpText,
  placeholder = "Select...",
  schema,
  entityType,
  search = "",
  className = "",
}: ReferenceSelectProps) {
  // Generate stable IDs to prevent hydration mismatches
  const baseId = useId();
  const instanceId = `reference-select-${baseId}`;
  const inputId = `reference-select-input-${baseId}`;

  // Add state for retry attempts
  const [_retryCount, setRetryCount] = useState(0);

  // Add state to track if component has hydrated
  const [isHydrated, setIsHydrated] = useState(false);

  // Set hydrated state after mount to prevent SSR mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Determine entity type from URL if not provided
  const derivedEntityType = useMemo(
    () => entityType || getEntityTypeFromUrlUtil(url),
    [entityType, url],
  );

  // Use the enhanced useReferenceData hook
  const {
    options,
    isLoading,
    error: fetchError,
    refetch,
  } = useReferenceData({
    url,
    search,
    schema,
    entityType: derivedEntityType,
    enabled: !disabled,
  });

  // Memoize the selectedValue transformation
  const selectedValue = useMemo(() => {
    // Ensure options is always an array
    const safeOptions = Array.isArray(options) ? options : [];

    if (!value) return multiple ? [] : null;

    if (multiple && Array.isArray(value)) {
      return safeOptions.filter((option) => value.includes(option.value));
    }

    return safeOptions.find((option) => option.value === value) || null;
  }, [value, options, multiple]);

  // Stable change handler
  const handleSelectChange = useCallback(
    (selected: unknown) => {
      const typedSelected = selected as
        | OptionType
        | readonly OptionType[]
        | null;

      if (multiple) {
        const values = typedSelected
          ? (typedSelected as readonly OptionType[]).map(
              (item: OptionType) => item.value,
            )
          : [];
        onChange(values);
      } else {
        onChange(typedSelected ? (typedSelected as OptionType).value : "");
      }
    },
    [multiple, onChange],
  );

  // Handle retry when errors occur
  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    refetch();
  }, [refetch]);

  // Handle blur event
  const handleBlur = useCallback(() => {
    onBlur?.();
  }, [onBlur]);

  // Don't render the Select component until after hydration to prevent mismatch
  if (!isHydrated) {
    return (
      <div className={`space-y-1 ${className}`}>
        <Label htmlFor={inputId}>{label}</Label>
        <div className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-500">
          Loading...
        </div>
        {helpText && <p className="text-sm text-gray-500 mt-1">{helpText}</p>}
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <Label htmlFor={inputId}>{label}</Label>

      {fetchError ? (
        <div className="text-red-500 text-sm p-2 border border-red-200 bg-red-50 rounded">
          <p>Error loading options: {String(fetchError)}</p>
          <button
            onClick={handleRetry}
            className="mt-2 px-2 py-1 text-xs bg-red-100 hover:bg-red-200 rounded transition-colors"
            type="button"
          >
            Try Again
          </button>
        </div>
      ) : (
        <Select
          instanceId={instanceId}
          inputId={inputId}
          isMulti={multiple}
          options={options}
          value={selectedValue}
          onChange={handleSelectChange}
          onBlur={handleBlur}
          isLoading={isLoading}
          isDisabled={disabled || isLoading}
          placeholder={isLoading ? "Loading options..." : placeholder}
          noOptionsMessage={() =>
            options.length === 0
              ? "No options available"
              : "No matching options"
          }
          className={`w-full ${error ? "border-destructive" : ""}`}
          classNamePrefix="reference-select"
          // Add explicit aria attributes to prevent hydration mismatches
          aria-activedescendant=""
        />
      )}

      {helpText && <p className="text-sm text-gray-500 mt-1">{helpText}</p>}
    </div>
  );
}

export default ReferenceSelect;
