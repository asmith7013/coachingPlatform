"use client";

import React, { useState } from "react";

// ✅ Type-safe field configuration
type FieldType = "text" | "email" | "select" | "multi-select";

interface Field<T> {
  key: keyof T;
  label: string;
  type: FieldType;
  options?: string[];
}

interface GenericAddFormProps<T> {
  title: string;
  defaultValues: T;
  onSubmit: (data: T) => Promise<{ success: boolean; error?: string }>;
  fields: Field<T>[];
}

export default function GenericAddForm<T extends Record<string, unknown>>({
  title,
  defaultValues,
  onSubmit,
  fields,
}: GenericAddFormProps<T>) {
  // ✅ Generic form state
  const [formData, setFormData] = useState<T>(defaultValues);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Generic change handler
  const handleChange = (
    key: keyof T,
    value: string | string[] | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ✅ Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const result = await onSubmit(formData);
      if (result.success) {
        setSuccess(true);
        setFormData(defaultValues);
        setShowForm(false);
      } else {
        setError(result.error || "Failed to submit form");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="mt-8 max-w-2xl mx-auto">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          {title}
        </button>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 mt-4">
          <h3 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2">{title}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ✅ Dynamically render fields based on configuration */}
            {fields.map((field) => (
              <div key={String(field.key)} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                
                {field.type === "multi-select" ? (
                  <select
                    multiple
                    value={formData[field.key] as string[]}
                    onChange={(e) => {
                      const selectedOptions = Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      );
                      handleChange(field.key, selectedOptions);
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : field.type === "select" ? (
                  <select
                    value={formData[field.key] as string}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.key] as string}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                )}
              </div>
            ))}

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                {title}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData(defaultValues);
                  setError(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* ✅ Success and error messaging */}
            {success && (
              <div className="text-green-600 mt-2 p-2 bg-green-50 rounded">
                Successfully added new {title.toLowerCase()}!
              </div>
            )}
            {error && (
              <div className="text-red-600 mt-2 p-2 bg-red-50 rounded">
                Error: {error}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
