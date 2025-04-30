"use client";

import React, { useMemo, useCallback, useState, useEffect, useRef } from "react";
import Select from "react-select";
import { Label } from "./Label";
import { useReferenceData } from "@/hooks/data/useReferenceData";
import { BaseReference } from "@core-types/reference";

export type OptionType = {
  value: string;
  label: string;
};

export type ReferenceSelectProps = {
  value: string[] | string;
  onChange: (value: string[] | string) => void;
  multiple?: boolean;
  label: string;
  url: string;
  disabled?: boolean;
  helpText?: string;
  placeholder?: string;
};


export function ReferenceSelect({
  value,
  onChange,
  multiple = false,
  label,
  url,
  disabled = false,
  helpText,
  placeholder = "Select...",
}: ReferenceSelectProps) {
  // Add state for retry attempts
  const [retryCount, setRetryCount] = useState(0);
  
  // Debug render count in development
  
  // Track URL, value, and multiple changes for debugging
  const urlRef = useRef(url);
  const valueRef = useRef(value);
  const multipleRef = useRef(multiple);
  
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
  
  // Use SWR to fetch options with caching and retry support
  const { options: rawOptions, error, isLoading } = useReferenceData<BaseReference>(url, "");
  
  // Transform BaseReference options to the format required by react-select
  const options = useMemo(() => {
    return rawOptions.map(option => ({
      value: option._id,
      label: option.label
    }));
  }, [rawOptions]);
  
  // Memoize the selectedValue transformation to prevent unnecessary recalculations 
  const selectedValue = useMemo(() => {
    // Ensure options is always an array
    const safeOptions = Array.isArray(options) ? options : [];
    
    if (!value) return multiple ? [] : null;
    
    if (multiple && Array.isArray(value)) {
      return safeOptions.filter(option => value.includes(option.value));
    }
    
    return safeOptions.find(option => option.value === value) || null;
  }, [value, options, multiple]);

  // Memoize the change handler to keep it stable
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
  }, [retryCount]);

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      
      {error ? (
        <div className="text-red-500 text-sm p-2 border border-red-200 bg-red-50 rounded">
          <p>Error loading options. {error.message}</p>
          <button 
            onClick={handleRetry}
            className="mt-2 px-2 py-1 text-xs bg-red-100 hover:bg-red-200 rounded transition-colors"
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