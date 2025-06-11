'use client';

import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/core/Button';
import { Alert } from '@/components/core/feedback/Alert';
import { Spinner } from '@/components/core/feedback/Spinner';
import { TanStackForm } from '@/lib/ui/forms/tanstack/components/TanStackForm';
import { teachingLabStaffFields } from '@/lib/ui/forms/fieldConfig/staff/teaching-lab-staff';
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

// Field configuration is now imported from domain-organized files

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any; // Type assertion needed due to TanStack Form interface compatibility
  
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
      const staffData: TeachingLabStaffInput = {
        ...data,
        mondayUser: {
          // Ensure all required fields from defaultValues are included
          mondayId: defaultValues.mondayUser?.mondayId || user.id,
          name: defaultValues.mondayUser?.name || user.name || '',
          email: defaultValues.mondayUser?.email || user.email || '',
          isConnected: true,
          // Include any other fields from the current mondayUser
          ...data.mondayUser,
          // Ensure the lastSynced is always a Date object
          lastSynced: defaultValues.mondayUser?.lastSynced || new Date().toISOString()
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
      
      <TanStackForm
        form={form}
        fields={teachingLabStaffFields}
        title="Create Teaching Lab Staff"
        description={`Creating staff record for ${user.name} (${user.email})`}
        submitLabel={isCreating ? "Creating Staff..." : "Create Teaching Lab Staff"}
        loading={isCreating}
      />
      
      <div className="flex justify-end gap-2 mt-6">
        <Button
          intent="secondary"
          appearance="outline"
          onClick={onCancel}
          disabled={isCreating}
        >
          Cancel
        </Button>
      </div>
      
      {isCreating && (
        <div className="flex justify-center">
          <Spinner size="md" />
        </div>
      )}
    </div>
  );
} 