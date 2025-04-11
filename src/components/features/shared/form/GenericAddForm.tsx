"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/typography/Heading";
import { Text } from "@/components/ui/typography/Text";
import { Input } from "@/components/ui/fields/Input";
import { Select } from "@/components/ui/fields/Select";
import { Switch } from '@/components/ui/fields/Switch';
import { Checkbox } from '@/components/ui/fields/Checkbox';
import { Textarea } from '@/components/ui/fields/Textarea';
import { shadows, spacingY, typography } from "@/lib/ui/tokens";
import { cn } from "@/lib/utils";

export type FieldType = 'text' | 'number' | 'email' | 'password' | 'select' | 'switch' | 'checkbox' | 'textarea';

export interface Field<T extends Record<string, unknown>> {
  name: keyof T;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: T[keyof T];
}

interface GenericAddFormProps<T extends Record<string, unknown>> {
  title: string;
  fields: Field<T>[];
  onSubmit: (data: T) => void;
  submitLabel?: string;
  defaultValues?: T;
}

export function GenericAddForm<T extends Record<string, unknown>>({
  title,
  fields,
  onSubmit,
  submitLabel = 'Add',
  defaultValues,
}: GenericAddFormProps<T>) {
  const [formData, setFormData] = useState<T>(
    defaultValues || fields.reduce((acc, field) => ({
      ...acc,
      [field.name]: field.type === 'select' ? (field.defaultValue ?? []) : (field.defaultValue ?? ''),
    }), {} as T)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (name: keyof T, value: T[keyof T]) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInputChange = (
    name: keyof T,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const input = e.target;
    let value: T[keyof T];

    if (input instanceof HTMLInputElement) {
      if (input.type === 'number') {
        value = Number(input.value) as T[keyof T];
      } else if (input.type === 'checkbox') {
        value = input.checked as T[keyof T];
      } else {
        value = input.value as T[keyof T];
      }
    } else {
      value = input.value as T[keyof T];
    }

    handleChange(name, value);
  };

  const renderField = (field: Field<T>) => {
    switch (field.type) {
      case 'select': {
        const value = formData[field.name];
        const isMultiSelect = Array.isArray(value);
        
        if (isMultiSelect) {
          return (
            <Select
              label={field.label}
              value={value as string[]}
              onChange={(newValue: string[]) => {
                handleChange(field.name, newValue as T[keyof T]);
              }}
              options={field.options || []}
              multiple={true}
            />
          );
        } else {
          return (
            <Select
              label={field.label}
              value={value as string}
              onChange={(newValue: string) => {
                handleChange(field.name, newValue as T[keyof T]);
              }}
              options={field.options || []}
              multiple={false}
            />
          );
        }
      }
      case 'switch':
        return (
          <Switch
            label={field.label}
            checked={formData[field.name] as boolean}
            onChange={(checked: boolean) => {
              handleChange(field.name, checked as T[keyof T]);
            }}
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            label={field.label}
            checked={formData[field.name] as boolean}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(field.name, e.target.checked as T[keyof T]);
            }}
          />
        );
      case 'textarea':
        return (
          <Textarea
            label={field.label}
            value={formData[field.name] as string}
            onChange={(e) => handleInputChange(field.name, e)}
            required={field.required}
          />
        );
      default:
        return (
          <Input
            type={field.type}
            label={field.label}
            value={formData[field.name] as string}
            onChange={(e) => handleInputChange(field.name, e)}
            required={field.required}
          />
        );
    }
  };

  return (
    <Card className={cn(shadows.md, spacingY.md, 'bg-secondary')}>
      <form onSubmit={handleSubmit} className={spacingY.md}>
        <div className={spacingY.md}>
          <Heading level="h2">{title}</Heading>
          <Text variant="text" className={cn(typography.text.base, 'text-text')}>
            Fill in the details below to add a new item.
          </Text>
        </div>
        <div className={spacingY.md}>
          {fields.map((field) => (
            <div key={String(field.name)} className={spacingY.sm}>
              {renderField(field)}
            </div>
          ))}
        </div>
        <div className="w-full">
          <Button type="submit" 
          // variant="primary" 
          className="w-full">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
