"use client";

import React from "react";

interface CustomDetailInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
}

/**
 * Text input for custom activity details
 */
export function CustomDetailInput({
  value,
  onChange,
  placeholder = "Enter details...",
  required = false,
  maxLength = 200,
}: CustomDetailInputProps) {
  return (
    <div className="w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <div className="mt-1 text-xs text-gray-500 text-right">
        {value.length} / {maxLength}
      </div>
    </div>
  );
}
