"use client"; // ✅ Ensures this component runs on the client-side.

import React, { useState } from "react";
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { Button } from '@/components/ui/button';
import { useNYCPSStaff } from "@/hooks/useNYCPSStaff"; // ✅ SWR hook for managing NYCPS Staff data.
import { NYCPSStaff } from "@/lib/zod-schema"; // ✅ Import the NYCPSStaff type from Zod schema.
import { NYCPSStaffInput } from "@/lib/zod-schema";
import { createNYCPSStaff, uploadNYCPSStaffFile } from "@actions/staff/nycps";
import { GenericAddForm } from "@/components/features/shared/form/GenericAddForm";
import BulkUploadForm from "@/components/features/shared/form/BulkUploadForm";
import { ResourceHeader } from "@/components/features/shared/ResourceHeader";
import { NYCPSStaffFieldConfig } from "@/lib/ui-schema/fieldConfig/core/staff";
import { cn } from "@/lib/utils";

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
    removeStaff,
    performanceMode,
    togglePerformanceMode
  } = useNYCPSStaff();

  const [searchInput, setSearchInput] = useState("");

  const confirmDeleteStaff = (id: string) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      handleDeleteStaff(id);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    await removeStaff(id);
  };

  if (loading) return <Text textSize="base">Loading NYCPS Staff...</Text>;
  if (staffError) return <Text textSize="base" color="danger">Error loading staff</Text>;

  return (
    <div className="container mx-auto p-8">
      <Heading 
        level="h2" 
        color="default"
        className={cn("text-primary font-bold mb-4")}
      >
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
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        performanceMode={performanceMode}
        togglePerformanceMode={togglePerformanceMode}
      />

      <div className="space-y-8">
        {staff.map((member: NYCPSStaff) => (
          <Card
            key={member._id}
            padding="md"
            radius="lg"
          >
            <div className="flex justify-between items-center">
              <div>
                <Heading 
                  level="h3" 
                  color="default"
                  className={cn("text-primary font-medium")}
                >
                  {member.staffName}
                </Heading>
                <Text 
                  textSize="base"
                  color="muted"
                  className="mt-2"
                >
                  {member.email || 'No email provided'}
                </Text>
              </div>
              <Button
                onClick={() => member._id && confirmDeleteStaff(member._id)}
                textSize="sm"
                padding="sm"
                className="text-danger"
              >
                🗑️ Delete
              </Button>
            </div>

            <div className="mt-4">
              <Heading 
                level="h3" 
                color="default"
                className={cn("text-primary font-medium mb-2")}
              >
                Roles
              </Heading>
              <div className="flex flex-wrap gap-2">
                {member.rolesNYCPS && member.rolesNYCPS.map((role, index) => (
                  <span 
                    key={index} 
                    className={cn(
                      'rounded-full px-3 py-1',
                      'text-sm',
                      'text-white',
                      'bg-primary'
                    )}
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <Heading 
                level="h3" 
                color="default"
                className={cn("text-primary font-medium mb-2")}
              >
                Subjects
              </Heading>
              <div className="flex flex-wrap gap-2">
                {member.subjects && member.subjects.map((subject, index) => (
                  <span 
                    key={index} 
                    className={cn(
                      'rounded-full px-3 py-1',
                      'text-sm',
                      'text-white',
                      'bg-success'
                    )}
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
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
