'use client';

import { useState } from 'react';
import { Button } from '@/components/core/Button';
import { Alert } from '@/components/core/feedback/Alert';
import { Spinner } from '@/components/core/feedback/Spinner';
import { RigidResourceForm as GenericResourceForm } from '@/components/composed/forms/RigidResourceForm';
import { createTeachingLabStaff } from '@/app/actions/staff';
import { TeachingLabStaffInput } from '@domain-types/staff';
import { TeachingLabStaffFieldConfig } from '@/lib/ui/forms/fieldConfig/core/teaching-lab-staff';
import { MondayUser } from '@/lib/integrations/monday/types';

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
      
      <GenericResourceForm
        title="Create Teaching Lab Staff"
        fields={TeachingLabStaffFieldConfig}
        onSubmit={handleSubmit}
        defaultValues={defaultValues as TeachingLabStaffInput}
        submitLabel={isCreating ? "Creating Staff..." : "Create Teaching Lab Staff"}
        mode="create"
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