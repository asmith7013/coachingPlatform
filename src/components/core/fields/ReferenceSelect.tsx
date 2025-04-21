"use client";

import React, { useMemo, useCallback } from "react";
import Select from "react-select";
import { Label } from "./Label";
import useSWR from "swr";

type OptionType = {
  value: string;
  label: string;
};

type ReferenceSelectProps = {
  value: string[] | string;
  onChange: (value: string[] | string) => void;
  multiple?: boolean;
  label: string;
  url: string;
  disabled?: boolean;
  helpText?: string;
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function ReferenceSelect({
  value,
  onChange,
  multiple = false,
  label,
  url,
  disabled = false,
  helpText,
}: ReferenceSelectProps) {
  // Use SWR to fetch options with caching
  const { data, error, isLoading } = useSWR<OptionType[]>(
    url, 
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Longer deduping to reduce API calls
      revalidateIfStale: false
    }
  );
  
  // Memoize options to prevent unnecessary recalculations
  const options = useMemo(() => data || [], [data]);
  
  // Memoize the selectedValue transformation to prevent unnecessary recalculations
  const selectedValue = useMemo(() => {
    if (!value) return multiple ? [] : null;
    
    if (multiple && Array.isArray(value)) {
      return options.filter(option => value.includes(option.value));
    }
    
    return options.find(option => option.value === value) || null;
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

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      
      {error ? (
        <div className="text-red-500 text-sm p-2 border border-red-200 bg-red-50 rounded">
          Error loading options. Please try again.
        </div>
      ) : (
        <Select
          isMulti={multiple}
          options={options}
          value={selectedValue}
          onChange={handleChange}
          isLoading={isLoading}
          isDisabled={disabled || isLoading}
          placeholder={isLoading ? "Loading options..." : "Select..."}
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