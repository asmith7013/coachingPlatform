'use client';

import { useState } from 'react';
import { useForm } from '@tanstack/react-form';

import { Alert } from '@/components/core/feedback/Alert';
import { Spinner } from '@/components/core/feedback/Spinner';
import { FormLayout } from '@components/composed/forms/FormLayout';
import { Input } from '@components/core/fields/Input';
import { Select } from '@components/core/fields/Select';
import { ReferenceSelect } from '@components/core/fields/ReferenceSelect';
import { TeachingLabStaffFieldConfig } from '@/lib/ui/forms/fieldConfig/staff/teaching-lab-staff';
import { createTeachingLabStaff } from '@/app/actions/staff';
import { TeachingLabStaffInput } from '@domain-types/staff';
import { TeachingLabStaffInputZodSchema } from '@zod-schema/core/staff';
import { MondayUser } from '@lib/integrations/monday/types/api';

// Extended MondayUser interface for additional properties
interface ExtendedMondayUser extends MondayUser {
  title?: string;
}

interface CreateTeachingLabStaffFormProps {
  user: MondayUser;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateTeachingLabStaffForm({ 
  user, 
  onSuccess, 
  onCancel 
}: CreateTeachingLabStaffFormProps) {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create default values based on the Monday user data
  const defaultValues: Partial<TeachingLabStaffInput> = {
    staffName: user.name || '',
    email: user.email || '',
    schools: [],
    owners: [],
    adminLevel: "Coach",
    assignedDistricts: [],
    rolesTL: [],
    // This field is not in the form, but will be included in the submitted data
    mondayUser: {
      mondayId: user.id,
      name: user.name || '',
      email: user.email || '',
      title: (user as ExtendedMondayUser).title || undefined,
      isVerified: true,
      isConnected: true,
      lastSynced: new Date().toISOString() // Use Date object directly
    }
  };

  // Create TanStack form with schema validation
  const form = useForm({
    defaultValues,
    validators: {
      onChange: TeachingLabStaffInputZodSchema,
      onSubmit: TeachingLabStaffInputZodSchema
    },
    onSubmit: async ({ value }) => {
      await handleSubmit(value as TeachingLabStaffInput);
    }
  });
  
  // Handle form submission
  const handleSubmit = async (data: TeachingLabStaffInput) => {
    try {
      // Validate required fields
      if (!data.adminLevel) {
        setError("Please select an Admin Level");
        return;
      }
      
      setIsCreating(true);
      setError(null);
      
      // Make a deep copy and ensure mondayUser data is preserved
      const mondayUser = defaultValues.mondayUser as { mondayId?: string; name?: string; email?: string; lastSynced?: string } | undefined;
      const staffData: TeachingLabStaffInput = {
        ...data,
        mondayUser: {
          // Ensure all required fields from defaultValues are included
          mondayId: mondayUser?.mondayId || user.id,
          name: mondayUser?.name || user.name || '',
          email: mondayUser?.email || user.email || '',
          isConnected: true,
          // Include any other fields from the current mondayUser
          ...(data.mondayUser as object | undefined),
          // Ensure the lastSynced is always a Date object
          lastSynced: mondayUser?.lastSynced || new Date().toISOString()
        }
      };
      
      const result = await createTeachingLabStaff(staffData);
      
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to create staff member");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert intent="error">
          <Alert.Title>Error</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert>
      )}
      
      <FormLayout
        title="Create Teaching Lab Staff"
        description={`Creating staff record for ${user.name} (${user.email})`}
        submitLabel={isCreating ? "Creating Staff..." : "Create Teaching Lab Staff"}
        isSubmitting={isCreating}
        canSubmit={form.state.canSubmit}
        onCancel={onCancel}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {TeachingLabStaffFieldConfig.map((fieldConfig) => (
            <div key={String(fieldConfig.name)} className="space-y-2">
              <label
                htmlFor={String(fieldConfig.name)}
                className="text-sm font-medium leading-none"
              >
                {fieldConfig.label}
              </label>
              
              <form.Field name={String(fieldConfig.name)}>
                {(field) => (
                  <div className="space-y-1">
                    {['text', 'email', 'password', 'number'].includes(fieldConfig.type) && (
                      <Input
                        type={fieldConfig.type}
                        value={String(field.state.value ?? '')}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder={fieldConfig.placeholder}
                        disabled={fieldConfig.disabled}
                      />
                    )}
                    {fieldConfig.type === 'select' && (
                      fieldConfig.multiple ? (
                        <Select
                          value={Array.isArray(field.state.value) ? field.state.value as string[] : []}
                          onChange={field.handleChange}
                          options={fieldConfig.options || []}
                          placeholder={fieldConfig.placeholder}
                          disabled={fieldConfig.disabled}
                          multiple={true}
                        />
                      ) : (
                        <Select
                          value={typeof field.state.value === 'string' ? field.state.value as string : ''}
                          onChange={field.handleChange}
                          options={fieldConfig.options || []}
                          placeholder={fieldConfig.placeholder}
                          disabled={fieldConfig.disabled}
                        />
                      )
                    )}
                    {fieldConfig.type === 'reference' && (
                      <ReferenceSelect
                        url={fieldConfig.url || ''}
                        value={field.state.value as string | string[]}
                        onChange={field.handleChange}
                        multiple={fieldConfig.multiple}
                        placeholder={fieldConfig.placeholder}
                        disabled={fieldConfig.disabled}
                        entityType={fieldConfig.entityType}
                        label={fieldConfig.label}
                      />
                    )}
                    {field.state.meta.errors?.length > 0 && typeof field.state.meta.errors[0] === 'string' && (
                      <p className="text-sm text-destructive">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>
          ))}
        </form>
      </FormLayout>
      
      {isCreating && (
        <div className="flex justify-center">
          <Spinner size="md" />
        </div>
      )}
    </div>
  );
} 