"use client";

import React, { useMemo, useCallback, useState, useEffect, useRef } from "react";
import Select from "react-select";
import { Label } from "./Label";
import { useReferenceData, getEntityTypeFromUrlUtil } from "@query/client/hooks/data/useReferenceData";
import { ZodSchema } from "zod";
import { BaseDocument } from "@core-types/document";

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
  
  /** Whether multiple selection is allowed */
  multiple?: boolean;
  
  /** Label for the input */
  label: string;
  
  /** URL to fetch options from */
  url: string;
  
  /** Whether the field is disabled */
  disabled?: boolean;
  
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
}

/**
 * A component for selecting references from API-sourced options
 * Automatically determines the correct data transformation based on URL pattern
 */
export function ReferenceSelect({
  value,
  onChange,
  multiple = false,
  label,
  url,
  disabled = false,
  helpText,
  placeholder = "Select...",
  schema,
  entityType,
  search = "",
  className = ""
}: ReferenceSelectProps) {
  // Add state for retry attempts
  const [retryCount, setRetryCount] = useState(0);
  
  // Debug tracking refs
  const urlRef = useRef(url);
  const valueRef = useRef(value);
  const multipleRef = useRef(multiple);
  
  // Debug logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (urlRef.current !== url) {
        console.log(`[Debug] ReferenceSelect URL changed: ${urlRef.current} -> ${url}`);
        urlRef.current = url;
      }
      
      if (JSON.stringify(valueRef.current) !== JSON.stringify(value)) {
        console.log(`[Debug] ReferenceSelect value changed:`, { from: valueRef.current, to: value });
        valueRef.current = value;
      }
      
      if (multipleRef.current !== multiple) {
        console.log(`[Debug] ReferenceSelect multiple changed: ${multipleRef.current} -> ${multiple}`);
        multipleRef.current = multiple;
      }
    }
  }, [url, value, multiple]);
  
  // Determine entity type from URL if not provided
  const derivedEntityType = useMemo(() => 
    entityType || getEntityTypeFromUrlUtil(url),
  [entityType, url]);
  
  // Use the enhanced useReferenceData hook
  const { 
    options, 
    isLoading, 
    error, 
    refetch 
  } = useReferenceData({
    url,
    search,
    schema,
    entityType: derivedEntityType,
    enabled: !disabled
  });
  
  // Memoize the selectedValue transformation 
  const selectedValue = useMemo(() => {
    // Ensure options is always an array
    const safeOptions = Array.isArray(options) ? options : [];
    
    if (!value) return multiple ? [] : null;
    
    if (multiple && Array.isArray(value)) {
      return safeOptions.filter(option => value.includes(option.value));
    }
    
    return safeOptions.find(option => option.value === value) || null;
  }, [value, options, multiple]);

  // Memoize the change handler
  const handleChange = useCallback((selected: OptionType | readonly OptionType[] | null) => {
    if (multiple) {
      const values = selected ? (selected as readonly OptionType[]).map((item: OptionType) => item.value) : [];
      onChange(values);
    } else {
      onChange(selected ? (selected as OptionType).value : '');
    }
  }, [multiple, onChange]);
  
  // Handle retry when errors occur
  const handleRetry = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Debug] Retrying ReferenceSelect fetch, attempt: ${retryCount + 1}`);
    }
    setRetryCount(prev => prev + 1);
    refetch();
  }, [retryCount, refetch]);

  return (
    <div className={`space-y-1 ${className}`}>
      <Label>{label}</Label>
      
      {error ? (
        <div className="text-red-500 text-sm p-2 border border-red-200 bg-red-50 rounded">
          <p>Error loading options: {error.message}</p>
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
          isMulti={multiple}
          options={options}
          value={selectedValue}
          onChange={handleChange}
          isLoading={isLoading}
          isDisabled={disabled || isLoading}
          placeholder={isLoading ? "Loading options..." : placeholder}
          noOptionsMessage={() => options.length === 0 ? "No options available" : "No matching options"}
          className="w-full"
          classNamePrefix="reference-select"
        />
      )}
      
      {helpText && (
        <p className="text-sm text-gray-500 mt-1">{helpText}</p>
      )}
    </div>
  );
}

export default ReferenceSelect; 