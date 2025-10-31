"use client";

import React from "react";
import {
  generateInquiryOptions,
  InquiryOptionGroup,
} from "../utils/generateInquiryOptions";

interface InquiryPickerProps {
  sections: string[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

/**
 * Nested/grouped dropdown for inquiry activity questions
 */
export function InquiryPicker({
  sections,
  value,
  onChange,
  required = false,
}: InquiryPickerProps) {
  const options = generateInquiryOptions(sections);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Select inquiry question...</option>
      {options.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
