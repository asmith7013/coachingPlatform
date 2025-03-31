/**
 * ⛳ Missing Atomic Components:
 * - <Heading /> - Need to create this component
 * - <Text /> - Need to create this component
 * - <Card /> - Need to create this component
 * 
 * ⛳ Missing Token Mappings:
 * - shadow-md -> Need to add shadow tokens
 * - border-b -> Need to add border utility tokens
 * - space-y-4 -> Need to add spacing utility tokens
 */

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { Input } from "@/components/ui/fields/Input";
import { Select } from "@/components/ui/fields/Select";
import { spacing, colorVariants, borderColors } from "@/lib/ui/tokens";
import { cn } from "@/lib/utils";

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
    <div className={cn("mt-8 max-w-2xl mx-auto")}>
      {!showForm ? (
        <Button
          onClick={() => setShowForm(true)}
          variant="primary"
          size="md"
        >
          {title}
        </Button>
      ) : (
        <Card className={cn(spacing.lg, spacing.md)}>
          <Heading level={3} className={cn("mb-4 pb-2 border-b", borderColors.default)}>
            {title}
          </Heading>
          <form onSubmit={handleSubmit} className={cn("space-y-4")}>
            {/* ✅ Dynamically render fields based on configuration */}
            {fields.map((field) => (
              <div key={String(field.key)} className={cn("space-y-2")}>
                <Text variant="secondary" className="font-medium">
                  {field.label}
                </Text>
                
                {field.type === "multi-select" ? (
                  <Select
                    multiple
                    value={formData[field.key] as string[]}
                    onChange={(value) => handleChange(field.key, value)}
                    options={field.options?.map(option => ({
                      value: option,
                      label: option
                    })) || []}
                  />
                ) : field.type === "select" ? (
                  <Select
                    value={formData[field.key] as string}
                    onChange={(value) => handleChange(field.key, value)}
                    options={field.options?.map(option => ({
                      value: option,
                      label: option
                    })) || []}
                  />
                ) : (
                  <Input
                    type={field.type}
                    value={formData[field.key] as string}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  />
                )}
              </div>
            ))}

            <div className={cn("flex space-x-4 pt-4")}>
              <Button
                type="submit"
                variant="primary"
                size="md"
              >
                {title}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData(defaultValues);
                  setError(null);
                }}
                variant="secondary"
                size="md"
              >
                Cancel
              </Button>
            </div>

            {/* ✅ Success and error messaging */}
            {success && (
              <Text className={cn(spacing.sm, "p-2 rounded", colorVariants.success)}>
                Successfully added new {title.toLowerCase()}!
              </Text>
            )}
            {error && (
              <Text className={cn(spacing.sm, "p-2 rounded", colorVariants.danger)}>
                Error: {error}
              </Text>
            )}
          </form>
        </Card>
      )}
    </div>
  );
}
