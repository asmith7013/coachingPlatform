"use client";

import React from "react";
import { Button } from "@/components/core/Button";
import { Input } from "@/components/core/fields/Input";
import { Textarea } from "@/components/core/fields/Textarea";
import { Text } from "@/components/core/typography/Text";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

interface ArrayFieldManagerProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  helpText?: string;
  addButtonLabel?: string;
  fieldType?: "input" | "textarea";
  maxItems?: number;
  minItems?: number;
  emptyMessage?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  required?: boolean;
  className?: string;
}

const variantStyles = {
  default: {
    label: "text-gray-700",
    container: "border-gray-200",
    button: "border-gray-300",
  },
  success: {
    label: "text-green-700",
    container: "border-green-200 bg-green-50",
    button: "border-green-300",
  },
  warning: {
    label: "text-orange-700",
    container: "border-orange-200 bg-orange-50",
    button: "border-orange-300",
  },
  danger: {
    label: "text-red-700",
    container: "border-red-200 bg-red-50",
    button: "border-red-300",
  },
  info: {
    label: "text-blue-700",
    container: "border-blue-200 bg-blue-50",
    button: "border-blue-300",
  },
};

export function ArrayFieldManager({
  label,
  items,
  onChange,
  placeholder = "Enter item",
  helpText,
  addButtonLabel = "Add Item",
  fieldType = "input",
  maxItems,
  minItems = 0,
  emptyMessage = "No items added yet.",
  variant = "default",
  required = false,
  className = "",
}: ArrayFieldManagerProps) {
  const styles = variantStyles[variant];

  const addItem = () => {
    if (!maxItems || items.length < maxItems) {
      onChange([...items, ""]);
    }
  };

  const updateItem = (index: number, value: string) => {
    const updated = [...items];
    updated[index] = value;
    onChange(updated);
  };

  const removeItem = (index: number) => {
    if (items.length > minItems) {
      onChange(items.filter((_, i) => i !== index));
    }
  };

  const canAdd = !maxItems || items.length < maxItems;
  const canRemove = items.length > minItems;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <Text
          textSize="sm"
          color="default"
          className={`font-medium ${styles.label}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Text>

        {canAdd && (
          <Button
            intent="secondary"
            appearance="outline"
            textSize="sm"
            padding="sm"
            onClick={addItem}
            className={`flex items-center gap-2 ${styles.button}`}
          >
            <PlusIcon className="h-4 w-4" />
            {addButtonLabel}
          </Button>
        )}
      </div>

      {/* Help Text */}
      {helpText && (
        <Text textSize="sm" color="muted" className="mt-1">
          {helpText}
        </Text>
      )}

      {/* Items List */}
      <div className={`space-y-2 p-3 rounded-md border ${styles.container}`}>
        {items.length === 0 ? (
          <Text textSize="sm" color="muted" className="italic text-center py-4">
            {emptyMessage}
          </Text>
        ) : (
          items.map((item, index) => (
            <div key={index} className="flex gap-2 items-start">
              {fieldType === "textarea" ? (
                <Textarea
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value)}
                  placeholder={`${placeholder} ${index + 1}`}
                  rows={2}
                  className="flex-1"
                />
              ) : (
                <Input
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value)}
                  placeholder={`${placeholder} ${index + 1}`}
                  className="flex-1"
                />
              )}

              {canRemove && (
                <Button
                  intent="danger"
                  appearance="outline"
                  textSize="sm"
                  padding="sm"
                  onClick={() => removeItem(index)}
                  className="mt-2 flex-shrink-0"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Item Count */}
      {maxItems && (
        <Text textSize="xs" color="muted" className="text-right">
          {items.length} / {maxItems} items
        </Text>
      )}
    </div>
  );
}
