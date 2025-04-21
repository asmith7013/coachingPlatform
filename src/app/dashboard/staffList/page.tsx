"use client"; // ✅ Ensures this component runs on the client-side.

import React, { useState } from "react";
import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Button } from '@/components/core/Button';
import { DashboardPage } from '@/components/layouts/DashboardPage';
// import { cn } from "@/lib/utils";
import { EmptyListWrapper } from '@/components/shared/EmptyListWrapper';
import { ResourceHeader } from "@/components/features/shared/ResourceHeader";
import { GenericResourceForm, Field, FieldType } from "@/components/features/shared/form/GenericResourceForm";
import BulkUploadForm from "@/components/features/shared/form/BulkUploadForm";
import { useNYCPSStaff } from "@/hooks/useNYCPSStaff";
import { NYCPSStaff, NYCPSStaffInput } from "@/lib/zod-schema/core/staff";
import { createNYCPSStaff, updateNYCPSStaff, deleteNYCPSStaff, uploadNYCPSStaffFile } from "@/app/actions/staff/nycps";
import { NYCPSStaffFieldConfig } from "@/lib/ui-schema/fieldConfig/core/staff";
import { Dialog } from "@/components/composed/dialogs/Dialog";
import { Badge } from '@/components/core/feedback/Badge';
// import { fetchSchoolOptions } from "@/lib/client-api";
import { NYCPSStaffOverrides } from "@/lib/ui-schema/formOverrides";
import { getReferenceSelectPropsForField } from "@/lib/ui/forms/helpers";

export default function NYCPSStaffList() {
  const {
    staff,
    total,
    loading,
    error: staffError,
    page,
    setPage,
    limit,
    applyFilters,
    changeSorting,
    removeStaff
  } = useNYCPSStaff();

  const [searchInput, setSearchInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<NYCPSStaff | null>(null);

  // Convert the field config to the proper type for GenericResourceForm
  const formFields = NYCPSStaffFieldConfig.map(field => {
    const fieldName = field.name as keyof NYCPSStaffInput;
    
    // Handle reference fields for schools and owners
    if (fieldName === 'schools' || fieldName === 'owners') {
      try {
        // Get the reference props from the overrides
        const referenceProps = getReferenceSelectPropsForField(NYCPSStaffOverrides, fieldName);
        
        return {
          ...field,
          type: 'reference' as FieldType, // Explicitly cast to FieldType
          url: referenceProps.url,
          multiple: referenceProps.multiple,
          label: referenceProps.label
        } as Field<NYCPSStaffInput>;
      } catch (error) {
        console.error(`Error applying override for ${String(fieldName)}:`, error);
        return field;
      }
    }
    
    return field;
  });

  const handleEdit = (member: NYCPSStaff) => {
    setEditTarget(member);
    setIsModalOpen(true);
  };

  const handleEditSubmit = async (data: NYCPSStaffInput) => {
    if (editTarget?._id) {
      await updateNYCPSStaff(editTarget._id, data);
      setIsModalOpen(false);
      setEditTarget(null);
    }
  };

  const confirmDeleteStaff = (id: string) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      handleDeleteStaff(id);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    await deleteNYCPSStaff(id);
    await removeStaff(id);
  };

  if (loading) return <Text textSize="base">Loading staff...</Text>;
  if (staffError) return <Text textSize="base" color="danger">Error loading staff</Text>;

  return (
    <DashboardPage 
      title="Staff"
      description="Manage and track your staff members."
    >
      <ResourceHeader<NYCPSStaffInput>
        page={page}
        setPage={setPage}
        total={total}
        limit={limit}
        sortOptions={[
          { key: "staffName", label: "Name" }
        ]}
        onSort={(field, order) => {
          if (field === "staffName") {
            changeSorting("staffName", order);
          }
        }}
        onSearch={(value) => applyFilters({ staffName: value })}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
      />

      <EmptyListWrapper items={staff} resourceName="staff members">
        {staff.map((member: NYCPSStaff) => (
          <Card
            key={member._id}
            className="mb-4 p-4 rounded-lg shadow-md bg-white border border-gray-200"
          >
            <div className="flex justify-between items-center">
              <div>
                <Heading 
                  level="h3" 
                  color="default"
                  className="flex items-center gap-2 text-primary font-medium"
                >
                  <span role="img" aria-label="person">🧑‍🏫</span>
                  {member.staffName}
                </Heading>
                {member.email && (
                  <Text 
                    textSize="base"
                    color="muted"
                    className="mt-2"
                  >
                    {member.email}
                  </Text>
                )}
                {member.subjects && member.subjects.length > 0 && (
                  <Text 
                    textSize="base"
                    color="muted"
                    className="mt-2"
                  >
                    <strong>Subjects:</strong> {member.subjects.join(', ')}
                  </Text>
                )}
                {member.rolesNYCPS && member.rolesNYCPS.length > 0 && (
                  <Text 
                    textSize="base"
                    color="muted"
                    className="mt-2"
                  >
                    <strong>Roles:</strong> {member.rolesNYCPS.join(', ')}
                  </Text>
                )}
                {member.schools?.length > 0 && (
                  <Text 
                    textSize="base"
                    color="muted"
                    className="mt-2 flex flex-wrap gap-2 items-center"
                  >
                    <strong>Schools:</strong>
                    {member.schools.map((schoolId) => (
                      <Badge key={schoolId}>{schoolId}</Badge>
                    ))}
                  </Text>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleEdit(member)}
                  padding="sm"
                  textSize="sm"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => member._id && confirmDeleteStaff(member._id)}
                  padding="sm"
                  textSize="sm"
                  className="text-danger"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </EmptyListWrapper>

      <div className="mt-8">
        <GenericResourceForm<NYCPSStaffInput>
          mode="create"
          title="Add NYCPS Staff"
          onSubmit={createNYCPSStaff}
          fields={formFields}
        />
        <BulkUploadForm
          title="Bulk Upload NYCPS Staff"
          description="Upload a CSV with staff name, email, roles, and subjects"
          onUpload={uploadNYCPSStaffFile}
        />
      </div>

      {/* Edit Modal */}
      {isModalOpen && editTarget && (
        <Dialog
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditTarget(null);
          }}
          title="Edit Staff Information"
        >
          <GenericResourceForm<NYCPSStaffInput>
            mode="edit"
            title="Edit Staff Information"
            fields={formFields}
            onSubmit={handleEditSubmit}
            defaultValues={{
              staffName: editTarget.staffName,
              email: editTarget.email ?? '',
              schools: editTarget.schools,
              owners: editTarget.owners,
              gradeLevelsSupported: editTarget.gradeLevelsSupported,
              subjects: editTarget.subjects,
              specialGroups: editTarget.specialGroups,
              rolesNYCPS: editTarget.rolesNYCPS ?? [],
              pronunciation: editTarget.pronunciation ?? '',
            }}
          />
          <Button
            appearance="alt"
            className="mt-6 w-full"
            onClick={() => {
              setIsModalOpen(false);
              setEditTarget(null);
            }}
          >
            Cancel
          </Button>
        </Dialog>
      )}
    </DashboardPage>
  );
}
