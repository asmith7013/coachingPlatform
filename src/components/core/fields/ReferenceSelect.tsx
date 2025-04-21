"use client";

import React, { useEffect, useState, useCallback } from "react";
import AsyncSelect from "react-select/async";
import { Label } from "./Label";
import { GroupBase, OptionsOrGroups } from "react-select";
import { useReferenceOptions } from "@/hooks/useReferenceOptions";

type OptionType = {
  value: string;
  label: string;
};

type Props = {
  value: string[] | string;
  onChange: (v: string[] | string) => void;
  multiple?: boolean;
  label: string;
  fetcher: (input: string) => Promise<OptionType[]>;
  disabled?: boolean;
};

// New props type for URL-based reference select
type URLProps = {
  value: string[] | string;
  onChange: (v: string[] | string) => void;
  multiple?: boolean;
  label: string;
  url: string;
  disabled?: boolean;
};

// New component that uses useReferenceOptions
export function URLReferenceSelect({
  value,
  onChange,
  multiple = true,
  label,
  url,
  disabled = false,
}: URLProps) {
  const [selectedOptions, setSelectedOptions] = useState<OptionType[] | OptionType | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const options = useReferenceOptions(url, searchQuery);

  /* Load labels for pre-selected ids on first mount */
  useEffect(() => {
    const loadInitialOptions = async () => {
      try {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          setSelectedOptions(multiple ? [] : null);
          setIsInitializing(false);
          return;
        }
        
        if (options.length === 0) {
          console.warn(`No options returned from API. Make sure your endpoint has data.`);
        }
        
        if (multiple && Array.isArray(value)) {
          const selected = options.filter(o => value.includes(o.value));
          
          // For IDs without matching options, create temporary placeholders
          const missingIds = value.filter(id => !options.some(o => o.value === id));
          const placeholders = missingIds.map(id => ({ value: id, label: `ID: ${id}` }));
          
          setSelectedOptions([...selected, ...placeholders]);
        } else if (!multiple && typeof value === 'string') {
          const option = options.find(o => o.value === value);
          setSelectedOptions(option || { value, label: `ID: ${value}` });
        }
      } catch (error) {
        console.error("Error loading options for reference field:", error);
        setError("Failed to load options. Please try again later.");
        setSelectedOptions(multiple ? [] : null);
      } finally {
        setIsInitializing(false);
      }
    };
    
    if (options.length > 0 || !isInitializing) {
      loadInitialOptions();
    }
  }, [value, options, multiple, isInitializing]);

  const loadOptions = useCallback(async (
    input: string
  ): Promise<OptionsOrGroups<OptionType, GroupBase<OptionType>>> => {
    try {
      setError(null);
      setSearchQuery(input);
      return options;
    } catch (error) {
      console.error("Error loading options:", error);
      setError("Failed to load options. Please try again.");
      return [];
    }
  }, [options]);

  if (error) {
    return (
      <div className="space-y-1">
        <Label>{label}</Label>
        <div className="p-2 text-sm text-red-500 border border-red-200 rounded-md bg-red-50">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <AsyncSelect
        cacheOptions
        defaultOptions
        loadOptions={loadOptions}
        isMulti={multiple}
        value={selectedOptions}
        onChange={(selected) => {
          if (multiple) {
            const selectedArray = selected as OptionType[];
            const ids = selectedArray ? selectedArray.map(option => option.value) : [];
            onChange(ids);
            setSelectedOptions(selectedArray || []);
          } else {
            const selectedItem = selected as OptionType;
            onChange(selectedItem ? selectedItem.value : '');
            setSelectedOptions(selectedItem || null);
          }
        }}
        isDisabled={disabled || isInitializing}
        className="w-full"
        classNamePrefix="reference-select"
        placeholder={isInitializing ? "Loading options..." : "Select..."}
        noOptionsMessage={({ inputValue }) => 
          inputValue 
            ? `No options found for "${inputValue}"` 
            : "No options available. Ensure data exists."
        }
      />
    </div>
  );
}

export default function ReferenceSelect({
  value,
  onChange,
  multiple = true,
  label,
  fetcher,
  disabled = false,
}: Props) {
  const [selectedOptions, setSelectedOptions] = useState<OptionType[] | OptionType | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* Load labels for pre-selected ids on first mount */
  useEffect(() => {
    const loadInitialOptions = async () => {
      try {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          setSelectedOptions(multiple ? [] : null);
          setIsInitializing(false);
          return;
        }
        
        // First, get all available options
        const opts = await fetcher("");
        
        if (opts.length === 0) {
          console.warn(`No options returned from fetcher. Make sure your API endpoint has data.`);
        }
        
        if (multiple && Array.isArray(value)) {
          const selected = opts.filter(o => value.includes(o.value));
          
          // For IDs without matching options, create temporary placeholders
          const missingIds = value.filter(id => !opts.some(o => o.value === id));
          const placeholders = missingIds.map(id => ({ value: id, label: `ID: ${id}` }));
          
          setSelectedOptions([...selected, ...placeholders]);
        } else if (!multiple && typeof value === 'string') {
          const option = opts.find(o => o.value === value);
          setSelectedOptions(option || { value, label: `ID: ${value}` });
        }
      } catch (error) {
        console.error("Error loading options for reference field:", error);
        setError("Failed to load options. Please try again later.");
        setSelectedOptions(multiple ? [] : null);
      } finally {
        setIsInitializing(false);
      }
    };
    
    loadInitialOptions();
  }, [value, fetcher, multiple]);

  const loadOptions = useCallback(async (
    input: string
  ): Promise<OptionsOrGroups<OptionType, GroupBase<OptionType>>> => {
    try {
      setError(null);
      return await fetcher(input);
    } catch (error) {
      console.error("Error loading options:", error);
      setError("Failed to load options. Please try again.");
      return [];
    }
  }, [fetcher]);

  if (error) {
    return (
      <div className="space-y-1">
        <Label>{label}</Label>
        <div className="p-2 text-sm text-red-500 border border-red-200 rounded-md bg-red-50">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <AsyncSelect
        cacheOptions
        defaultOptions
        loadOptions={loadOptions}
        isMulti={multiple}
        value={selectedOptions}
        onChange={(selected) => {
          if (multiple) {
            const selectedArray = selected as OptionType[];
            const ids = selectedArray ? selectedArray.map(option => option.value) : [];
            onChange(ids);
            setSelectedOptions(selectedArray || []);
          } else {
            const selectedItem = selected as OptionType;
            onChange(selectedItem ? selectedItem.value : '');
            setSelectedOptions(selectedItem || null);
          }
        }}
        isDisabled={disabled || isInitializing}
        className="w-full"
        classNamePrefix="reference-select"
        placeholder={isInitializing ? "Loading options..." : "Select..."}
        noOptionsMessage={({ inputValue }) => 
          inputValue 
            ? `No options found for "${inputValue}"` 
            : "No options available. Ensure data exists."
        }
      />
    </div>
  );
} 