'use client'

import { useState } from 'react'
import { cn } from '@ui/utils/formatters';
import { Text } from '@/components/core/typography/Text'
import { Card } from '@/components/composed/cards/Card'
import { Button } from '@/components/core/Button'
import { Dialog } from '@/components/composed/dialogs/Dialog'
import { RigidResourceForm as GenericResourceForm, Field } from '@/components/composed/forms/RigidResourceForm'
import type { NYCPSStaff, TeachingLabStaff } from '@zod-schema/core/staff'
import { NYCPSStaffFieldConfig } from '@/lib/ui/forms/fieldConfig/core/staff'
import { TeachingLabStaffFieldConfig } from '@/lib/ui/forms/fieldConfig/core/teaching-lab-staff'

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

  // Determine which field config to use based on staff type
  const fieldConfig = staffType === 'nycps' 
    ? NYCPSStaffFieldConfig 
    : TeachingLabStaffFieldConfig

  const handleSubmit = async (formData: Record<string, unknown>) => {
    if (onUpdate) {
      onUpdate({
        ...staff,
        ...formData as Partial<StaffMember>
      })
    }
    setIsEditMode(false)
  }

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
          <div>
            <GenericResourceForm
              title=""
              fields={fieldConfig as unknown as Field<Record<string, unknown>>[]}
              defaultValues={staff as Record<string, unknown>}
              onSubmit={handleSubmit}
              mode="edit"
            />
            <div className="mt-4 flex justify-end space-x-3">
              <Button
                intent="secondary"
                appearance="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fieldConfig.map(field => (
                <div key={String(field.key)} className="mb-4">
                  <Text textSize="sm" weight="semibold" className="block mb-1">
                    {field.label}
                  </Text>
                  <Text textSize="base">
                    {renderFieldValue(String(field.key), (staff as Record<string, unknown>)[String(field.key)])}
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