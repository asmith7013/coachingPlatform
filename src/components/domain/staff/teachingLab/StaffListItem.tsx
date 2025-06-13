'use client'

import React, { useState } from 'react'
import { cn } from '@ui/utils/formatters';
import { Text } from '@core-components/typography/Text'
import { Card } from '@composed-components/cards/Card'
import { Button } from '@core-components/Button'
import { Dialog } from '@composed-components/dialogs/Dialog'
import { FormLayout } from '@components/composed/forms/FormLayout';
import { useFieldRenderer } from '@/lib/ui/forms/hooks/useFieldRenderer';
import type { Field } from '@ui-types/form'
import type { NYCPSStaff, TeachingLabStaff } from '@zod-schema/core/staff'
import { NYCPSStaffFieldConfig } from '@forms/fieldConfig/staff/nycps-staff';
import { TeachingLabStaffFieldConfig } from '@forms/fieldConfig/staff/teaching-lab-staff';
import { useForm } from '@tanstack/react-form';
import { NYCPSStaffInputZodSchema, TeachingLabStaffInputZodSchema } from '@zod-schema/core/staff';

type StaffMember = NYCPSStaff | TeachingLabStaff
type StaffType = 'nycps' | 'tl'

export interface StaffListItemProps {
  staff: StaffMember
  staffType?: StaffType
  className?: string
  onUpdate?: (updatedStaff: StaffMember) => void
}

export function StaffListItem({ 
  staff, 
  staffType = 'nycps', 
  className,
  onUpdate
}: StaffListItemProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const { renderField } = useFieldRenderer<StaffMember>();

  // Determine which field config to use based on staff type
  const fieldConfig = staffType === 'nycps' 
    ? NYCPSStaffFieldConfig 
    : TeachingLabStaffFieldConfig

  const _handleSubmit = async (formData: Record<string, unknown>) => {
    if (onUpdate) {
      onUpdate({
        ...staff,
        ...formData as Partial<StaffMember>
      })
    }
    setIsEditMode(false)
  }

  // Create form instance for editing staff - modern TanStack Form v1+ approach
  const editStaffForm = useForm({
    defaultValues: staff as Record<string, unknown>,
    // Native Zod schema validation - no adapter needed in v1+
    validators: {
      onChange: staffType === 'nycps' ? NYCPSStaffInputZodSchema : TeachingLabStaffInputZodSchema,
    },
    onSubmit: async ({ value }) => {
      await _handleSubmit(value);
    },
  });

  // Function to render a single field value
  const renderFieldValue = (key: string, value: unknown) => {
    if (value === undefined || value === null) {
      return <span className="text-gray-400 italic">Not provided</span>
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-400 italic">None</span>
      }
      return value.join(', ')
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }

    return String(value)
  }

  // Cancel handler for edit mode
  const handleCancel = () => {
    setIsEditMode(false)
  }

  return (
    <>
      <Card className={cn('p-4 hover:shadow-md transition-shadow', className)}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-3 md:mb-0">
            <Text textSize="lg" weight="semibold" className="mb-1">
              {staff.staffName}
            </Text>
            
            <Text color="muted" textSize="sm" className="mb-1">
              {staff.email || 'No email provided'}
            </Text>
            
            {staffType === 'nycps' && 'subjects' in staff && (
              <div className="flex flex-wrap gap-1 mt-2">
                {staff.subjects.slice(0, 3).map((subject, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20"
                  >
                    {subject}
                  </span>
                ))}
                {staff.subjects.length > 3 && (
                  <span className="text-xs text-muted">
                    +{staff.subjects.length - 3} more
                  </span>
                )}
              </div>
            )}
            
            {staffType === 'tl' && 'rolesTL' in staff && staff.rolesTL && (
              <div className="flex flex-wrap gap-1 mt-2">
                {staff.rolesTL.slice(0, 3).map((role, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20"
                  >
                    {role}
                  </span>
                ))}
                {staff.rolesTL.length > 3 && (
                  <span className="text-xs text-muted">
                    +{staff.rolesTL.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              intent="secondary"
              appearance="outline"
              textSize="sm"
              radius="md"
              onClick={() => {
                setIsEditMode(false)
                setIsDialogOpen(true)
              }}
            >
              View Details
            </Button>
          </div>
        </div>
      </Card>

      <Dialog 
        open={isDialogOpen} 
        onClose={() => {
          setIsDialogOpen(false)
          setIsEditMode(false)
        }}
        title={isEditMode ? `Edit ${staff.staffName}` : staff.staffName}
        size="lg"
      >
        {isEditMode ? (
          <FormLayout
            title=""
            submitLabel="Save Changes"
            onCancel={handleCancel}
            isSubmitting={editStaffForm.state.isSubmitting}
            canSubmit={editStaffForm.state.canSubmit}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                editStaffForm.handleSubmit();
              }}
              className="space-y-4"
            >
              {(fieldConfig as Field<StaffMember>[]).map((fieldConfig) => (
                <div key={String(fieldConfig.name)} className="space-y-2">
                  <label
                    htmlFor={String(fieldConfig.name)}
                    className="text-sm font-medium leading-none"
                  >
                    {fieldConfig.label}
                  </label>
                  
                  <editStaffForm.Field name={String(fieldConfig.name)}>
                    {(field) => renderField(fieldConfig, field)}
                  </editStaffForm.Field>
                </div>
              ))}
            </form>
          </FormLayout>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fieldConfig.map((field: Field<StaffMember>) => (
                <div key={String(field.name)} className="mb-4">
                  <Text textSize="sm" weight="semibold" className="block mb-1">
                    {field.label}
                  </Text>
                  <Text textSize="base">
                    {renderFieldValue(String(field.name), (staff as Record<string, unknown>)[String(field.name)])}
                  </Text>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                intent="secondary"
                appearance="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Close
              </Button>
              <Button
                intent="primary"
                onClick={() => setIsEditMode(true)}
              >
                Edit Staff
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  )
} 