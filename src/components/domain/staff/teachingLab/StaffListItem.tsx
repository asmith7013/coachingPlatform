"use client";

import React, { useState } from "react";
import { cn } from "@ui/utils/formatters";
import { Text } from "@core-components/typography/Text";
import { Card } from "@composed-components/cards/Card";
import { Button } from "@core-components/Button";
import { Dialog } from "@composed-components/dialogs/Dialog";
import { FormLayout } from "@components/composed/forms/FormLayout";
import { useForm } from "@tanstack/react-form";
import { Input } from "@components/core/fields/Input";
import { Textarea } from "@components/core/fields/Textarea";
import {
  NYCPSStaff,
  NYCPSStaffInputZodSchema,
  StaffMember,
  TeachingLabStaffInputZodSchema,
} from "@zod-schema/core/staff";

type StaffType = "nycps" | "tl";

export interface StaffListItemProps {
  staff: NYCPSStaff;
  staffType?: StaffType;
  className?: string;
  onUpdate?: (updatedStaff: StaffMember) => void;
}

export function StaffListItem({
  staff,
  staffType = "nycps",
  className,
  onUpdate,
}: StaffListItemProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const _handleSubmit = async (formData: Record<string, unknown>) => {
    if (onUpdate) {
      onUpdate({
        ...staff,
        ...(formData as Partial<StaffMember>),
      });
    }
    setIsEditMode(false);
  };

  // Create form instance for editing staff - modern TanStack Form v1+ approach
  const editStaffForm = useForm({
    defaultValues:
      staffType === "nycps"
        ? NYCPSStaffInputZodSchema.parse(staff)
        : TeachingLabStaffInputZodSchema.parse(staff),
    validators: {
      onChange: (value) => {
        const result =
          staffType === "nycps"
            ? NYCPSStaffInputZodSchema.safeParse(value)
            : TeachingLabStaffInputZodSchema.safeParse(value);
        if (!result.success) throw result.error;
      },
    },
    onSubmit: async ({ value }) => {
      await _handleSubmit(value);
    },
  });

  // Cancel handler for edit mode
  const handleCancel = () => {
    setIsEditMode(false);
  };

  return (
    <>
      <Card className={cn("p-4 hover:shadow-md transition-shadow", className)}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-3 md:mb-0">
            <Text textSize="lg" weight="semibold" className="mb-1">
              {staff.staffName}
            </Text>

            <Text color="muted" textSize="sm" className="mb-1">
              {staff.email || "No email provided"}
            </Text>

            {staffType === "nycps" && "subjects" in staff && (
              <div className="flex flex-wrap gap-1 mt-2">
                {staff.subjects
                  .slice(0, 3)
                  .map((subject: string, index: number) => (
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

            {/* {staffType === 'tl' && 'rolesTL' in staff && staff.rolesTL && (
              <div className="flex flex-wrap gap-1 mt-2">
                {staff.rolesTL.slice(0, 3).map((role: string, index: number) => (
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
            )} */}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              intent="secondary"
              appearance="outline"
              textSize="sm"
              radius="md"
              onClick={() => {
                setIsEditMode(false);
                setIsDialogOpen(true);
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
          setIsDialogOpen(false);
          setIsEditMode(false);
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
              {/* Explicit field rendering for NYCPSStaff */}
              {staffType === "nycps" && (
                <>
                  <editStaffForm.Field name="staffName">
                    {(field) => <Input fieldApi={field} label="Name" />}
                  </editStaffForm.Field>
                  <editStaffForm.Field name="email">
                    {(field) => <Input fieldApi={field} label="Email" />}
                  </editStaffForm.Field>
                  <editStaffForm.Field name="subjects">
                    {(field) => <Textarea fieldApi={field} label="Subjects" />}
                  </editStaffForm.Field>
                  {/* Add more fields as needed for NYCPSStaff */}
                </>
              )}
              {/* Explicit field rendering for TeachingLabStaff */}
              {staffType === "tl" && (
                <>
                  <editStaffForm.Field name="staffName">
                    {(field) => <Input fieldApi={field} label="Name" />}
                  </editStaffForm.Field>
                  <editStaffForm.Field name="email">
                    {(field) => <Input fieldApi={field} label="Email" />}
                  </editStaffForm.Field>
                  <editStaffForm.Field name="rolesTL">
                    {(field) => <Textarea fieldApi={field} label="Roles" />}
                  </editStaffForm.Field>
                  {/* Add more fields as needed for TeachingLabStaff */}
                </>
              )}
            </form>
          </FormLayout>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Explicit field rendering for NYCPSStaff */}
              {staffType === "nycps" && (
                <>
                  <div className="mb-4">
                    <Text
                      textSize="sm"
                      weight="semibold"
                      className="block mb-1"
                    >
                      Name
                    </Text>
                    <span>{staff.staffName}</span>
                  </div>
                  <div className="mb-4">
                    <Text
                      textSize="sm"
                      weight="semibold"
                      className="block mb-1"
                    >
                      Email
                    </Text>
                    <span>{staff.email}</span>
                  </div>
                  <div className="mb-4">
                    <Text
                      textSize="sm"
                      weight="semibold"
                      className="block mb-1"
                    >
                      Subjects
                    </Text>
                    <span>
                      {Array.isArray(staff.subjects)
                        ? staff.subjects.join(", ")
                        : staff.subjects}
                    </span>
                  </div>
                  {/* Add more fields as needed for NYCPSStaff */}
                </>
              )}
              {/* Explicit field rendering for TeachingLabStaff */}
              {staffType === "tl" && (
                <>
                  <div className="mb-4">
                    <Text
                      textSize="sm"
                      weight="semibold"
                      className="block mb-1"
                    >
                      Name
                    </Text>
                    <span>{staff.staffName}</span>
                  </div>
                  <div className="mb-4">
                    <Text
                      textSize="sm"
                      weight="semibold"
                      className="block mb-1"
                    >
                      Email
                    </Text>
                    <span>{staff.email}</span>
                  </div>
                  <div className="mb-4">
                    <Text
                      textSize="sm"
                      weight="semibold"
                      className="block mb-1"
                    >
                      Roles
                    </Text>
                    {/* <span>{Array.isArray(staff.rolesTL) ? staff.rolesTL.join(', ') : staff.rolesTL}</span> */}
                  </div>
                  {/* Add more fields as needed for TeachingLabStaff */}
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                intent="secondary"
                appearance="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Close
              </Button>
              <Button intent="primary" onClick={() => setIsEditMode(true)}>
                Edit Staff
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
