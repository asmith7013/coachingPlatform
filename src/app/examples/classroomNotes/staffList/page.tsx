"use client"; // ✅ Ensures this component runs on the client-side.

import React, { useState, useCallback, memo } from "react";
import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Button } from '@/components/core/Button';
import { DashboardPage } from '@/components/layouts/DashboardPage';
// import { cn } from "@/lib/utils";
import { EmptyListWrapper } from '@/components/shared/EmptyListWrapper';
import { ResourceHeader } from "@/components/shared/ResourceHeader";
import { Field, FieldType, MemoizedRigidResourceForm as MemoizedGenericResourceForm } from "@/components/composed/forms/RigidResourceForm";
import BulkUploadForm from "@/components/composed/forms/BulkUploadForm";
import { useNYCPSStaff } from "@/hooks/domain/useNYCPSStaff";
import { NYCPSStaff, NYCPSStaffInput } from "@zod-schema/core/staff";
import { createNYCPSStaff, updateNYCPSStaff, deleteNYCPSStaff, uploadNYCPSStaffFile } from "@/app/actions/staff";
import { NYCPSStaffFieldConfig } from "@ui-forms/fieldConfig/core/staff";
import { Dialog } from "@/components/composed/dialogs/Dialog";
import { Badge } from '@/components/core/feedback/Badge';
// import { fetchSchoolOptions } from "@/lib/client-api";
import { NYCPSStaffOverrides } from "@ui-forms/formOverrides";
import { getReferenceSelectPropsForField } from "@ui-forms/helpers";
import Link from "next/link";



// Create a memoized StaffCard component to prevent unnecessary re-renders
interface StaffCardProps {
  member: NYCPSStaff;
  onEdit: (member: NYCPSStaff) => void;
  onDelete: (id: string) => void;
}

const StaffCard = memo(function StaffCard({ member, onEdit, onDelete }: StaffCardProps) {
  return (
    <Card
      key={member._id}
      radius="lg"
      shadow="md"
      padding="md"
      className="mb-4"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <Heading 
            level="h3" 
            color="accent"
            className="flex items-center gap-2 font-medium"
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
          {member.schools && member.schools.length > 0 && (
            <Text 
              textSize="base"
              color="muted"
              className="mt-2 flex flex-wrap gap-2 items-center"
            >
              <strong>Schools:</strong>
              {member.schools.map((schoolId) => (
                <Badge key={schoolId} intent="secondary">
                  {schoolId}
                </Badge>
              ))}
            </Text>
          )}
          {member._id?.length > 0 && (
            <Text 
              textSize="base"
              color="muted"
              className="mt-2 flex flex-wrap gap-2 items-center"
            >
              
              <strong>_id:</strong>
              {member._id}
            </Text>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/staff/${member._id}`} passHref>
            <Button
              intent="secondary"
              appearance="outline"
              padding="sm"
              textSize="sm"
              radius="md"
            >
              View Details
            </Button>
          </Link>
          <Button
            onClick={() => onEdit(member)}
            intent="primary"
            appearance="solid"
            padding="sm"
            textSize="sm"
            radius="md"
          >
            Edit
          </Button>
          <Button
            onClick={() => member._id && onDelete(member._id)}
            intent="primary"
            appearance="outline"
            padding="sm"
            textSize="sm"
            radius="md"
            className="text-danger hover:bg-danger-50 border-danger"
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
});

const NYCPSStaffList = memo(function NYCPSStaffListComponent() {
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

  // Memoize the form fields to prevent recreation on each render
  const formFields = React.useMemo(() => {
    return NYCPSStaffFieldConfig.map(field => {
      const fieldName = field.key as keyof NYCPSStaffInput;
      
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
  }, []);

  const handleEdit = useCallback((member: NYCPSStaff) => {
    setEditTarget(member);
    setIsModalOpen(true);
  }, []);

  const handleEditSubmit = useCallback(async (data: NYCPSStaffInput) => {
    if (editTarget?._id) {
      await updateNYCPSStaff(editTarget._id, data);
      setIsModalOpen(false);
      setEditTarget(null);
    }
  }, [editTarget]);

  const handleDeleteStaff = useCallback(async (id: string) => {
    await deleteNYCPSStaff(id);
    await removeStaff(id);
  }, [removeStaff]);

  const confirmDeleteStaff = useCallback((id: string) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      handleDeleteStaff(id);
    }
  }, [handleDeleteStaff]);
  
  const handleSort = useCallback((field: string, order: "asc" | "desc") => {
    if (field === "staffName") {
      changeSorting("staffName", order);
    }
  }, [changeSorting]);
  
  const handleSearch = useCallback((value: string) => {
    applyFilters({ staffName: value });
  }, [applyFilters]);
  
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditTarget(null);
  }, []);

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
        onSort={handleSort}
        onSearch={handleSearch}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
      />

      <EmptyListWrapper items={staff} resourceName="staff members">
        {/* Use virtualization for large lists when needed */}
        {staff.length > 100 ? (
          <div className="virtual-list-warning bg-yellow-50 p-4 rounded mb-4">
            <Text color="accent" className="text-yellow-700">Large staff list detected. Consider implementing virtualization for better performance.</Text>
          </div>
        ) : null}
        
        {/* Render staff cards with memoized component */}
        {staff.map((member: NYCPSStaff) => (
          <StaffCard
            key={member._id}
            member={member}
            onEdit={handleEdit}
            onDelete={confirmDeleteStaff}
          />
        ))}
      </EmptyListWrapper>

      <div className="mt-8">
        <MemoizedGenericResourceForm<NYCPSStaffInput>
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
          onClose={handleCloseModal}
          title="Edit Staff Information"
        >
          <MemoizedGenericResourceForm<NYCPSStaffInput>
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
            onClick={handleCloseModal}
          >
            Cancel
          </Button>
        </Dialog>
      )}
    </DashboardPage>
  );
});

export default NYCPSStaffList;
