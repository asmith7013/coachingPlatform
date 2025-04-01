"use client"; // ✅ Ensures this component runs on the client-side.

import React from "react";
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { Button } from '@/components/ui/button';
import { spacing, textColors, colorVariants } from '@/lib/ui/tokens';
import { useNYCPSStaff } from "@/hooks/useNYCPSStaff"; // ✅ SWR hook for managing NYCPS Staff data.
import { NYCPSStaff } from "@/lib/zod-schema"; // ✅ Import the NYCPSStaff type from Zod schema.
import { NYCPSStaffInput } from "@/lib/zod-schema";
import { createNYCPSStaff, uploadNYCPSStaffFile } from "@actions/staff/nycps";
import { GenericAddForm } from "@/components/features/shared/form/GenericAddForm";
import BulkUploadForm from "@/components/features/shared/form/BulkUploadForm";
import { ResourceHeader } from "@/components/features/shared/ResourceHeader";
import { NYCPSStaffFieldConfig } from "@/lib/ui-schema/fieldConfig/core/staff";

const createEmptyNYCPSStaff = (): NYCPSStaffInput => ({
  staffName: "",
  email: "",
  schools: [],
  owners: [],
  gradeLevelsSupported: [],
  subjects: [],
  specialGroups: [],
  rolesNYCPS: [],
  pronunciation: ""
});

export default function NYCPSStaffList() {
  // ✅ 5. Data Flow Integrity: Use `useNYCPSStaff` to fetch, filter, paginate, and sort data.
  const { 
    staff, // ✅ Array of NYCPS Staff retrieved from the database.
    loading, // ✅ Boolean indicating if data is currently loading.
    // error, // ✅ Stores any errors that occur during data fetching.
    page, // ✅ Current page for pagination.
    setPage, // ✅ Function to update the current page.
    limit, // ✅ Number of Staff displayed per page.
    total, // ✅ Total number of Staff available.
    removeStaff, // ✅ Function to delete a Staff member.
    applyFilters, // ✅ Function to filter Staff dynamically.
    changeSorting, // ✅ Function to change sorting order.
    performanceMode, // ✅ Flag indicating whether performance optimizations are enabled.
    togglePerformanceMode // ✅ Function to toggle performance mode.
  } = useNYCPSStaff();

  // ✅ 7. Optimistic Updates: Confirm and delete Staff using an SWR-based hook.
  const confirmDeleteStaff = (id: string) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      handleDeleteStaff(id);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    await removeStaff(id);  // ✅ Calls the SWR mutate function to ensure an optimistic UI update.
  };

  // ✅ 6. Server Actions Error Handling: Display a loading indicator or handle errors.
  if (loading) return <Text>Loading NYCPS Staff...</Text>;
  // if (error) return <p>Error: {error}</p>;

  return (
    <div className={`container mx-auto ${spacing.lg}`}>
      <Heading level={2} className={`${textColors.primary} ${spacing.md}`}>
        NYCPS Staff
      </Heading>

      <ResourceHeader<NYCPSStaff>
        page={page}
        total={total}
        limit={limit}
        setPage={setPage}
        sortOptions={[
          { key: "staffName", label: "Staff Name" },
          { key: "email", label: "Email" },
          { key: "rolesNYCPS", label: "Roles" }
        ]}
        onSort={(field, order) => changeSorting(field as keyof NYCPSStaff, order)}
        onSearch={(value) => applyFilters({ staffName: value })}
        performanceMode={performanceMode}
        togglePerformanceMode={togglePerformanceMode}
      />

      {/* ✅ 5. Data Flow Integrity: SWR ensures data consistency between UI and database */}
      <div className={spacing.lg}>
        {staff.map((member: NYCPSStaff) => (
          <Card
            key={member._id}
            className={spacing.md}
            padding="md"
            radius="lg"
          >
            <div className="flex justify-between items-center">
              <div>
                <Heading level={3} className={textColors.primary}>
                  {member.staffName}
                </Heading>
                <Text variant="secondary" className={spacing.sm}>
                  {member.email || 'No email provided'}
                </Text>
              </div>
              {/* ✅ Optimistic UI Update: Delete Button */}
              <Button
                onClick={() => member._id && confirmDeleteStaff(member._id)}
                variant="danger"
                size="sm"
              >
                🗑️ Delete
              </Button>
            </div>

            {/* ✅ 15. Schema Nesting & Type Inference: Dynamically render roles and subjects */}
            <div className={spacing.md}>
              <Heading level={3} className={`${textColors.primary} ${spacing.md}`}>
                Roles
              </Heading>
              <div className="flex flex-wrap gap-2">
                {member.rolesNYCPS && member.rolesNYCPS.map((role, index) => (
                  <span 
                    key={index} 
                    className={`${spacing.sm} ${colorVariants.primary} rounded-full text-sm`}
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className={spacing.md}>
              <Heading level={3} className={`${textColors.primary} ${spacing.md}`}>
                Subjects
              </Heading>
              <div className="flex flex-wrap gap-2">
                {member.subjects && member.subjects.map((subject, index) => (
                  <span 
                    key={index} 
                    className={`${spacing.sm} ${colorVariants.success} rounded-full text-sm`}
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className={spacing.lg}>
        <GenericAddForm
          title="Add NYCPS Staff"
          defaultValues={createEmptyNYCPSStaff()}
          onSubmit={createNYCPSStaff}
          fields={NYCPSStaffFieldConfig}
        />
        <BulkUploadForm
          title="Bulk Upload NYCPS Staff"
          description="Upload a CSV with staff name, email, roles, and subjects"
          onUpload={uploadNYCPSStaffFile}
        />
      </div>
    </div>
  );
}
