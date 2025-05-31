"use client"; // ✅ Ensures this component runs on the client-side.

import React, { useState, 
  // useCallback 
} from "react";
import { Text } from '@/components/core/typography/Text';
import { Button } from '@/components/core/Button';
import { DashboardPage } from '@/components/composed/layouts/DashboardPage';
import { useSchoolsList, useSchoolsMutations, type SchoolWithDates } from "@hooks/domain/useSchools";
// import type { SchoolInput } from "@domain-types/school";
// import { ResourceHeader } from "@/components/composed/layouts/ResourceHeader";
import { EmptyListWrapper } from '@/components/core/empty/EmptyListWrapper';
import { SchoolCard } from '@/components/domain/schools/SchoolCard';
import { CreateSchoolDialog } from '@/components/composed/dialogs/CreateSchoolDialog';
import { BuildingLibraryIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

type School = SchoolWithDates;
// import { createSchool, uploadSchoolFile } from "@actions/schools/schools";
// import { Field, RigidResourceForm as GenericResourceForm } from "@components/composed/forms/RigidResourceForm";
// import BulkUploadForm from "@components/composed/forms/BulkUploadForm";
// import { SchoolFieldConfig } from "@ui-forms/fieldConfig/core/school";

export default function SchoolList() {
  // Use the React Query-based hooks
  const {
    items: schools = [],
    // total = 0,
    isLoading: loading,
    error: schoolError,
    // page,
    // setPage,
    // pageSize: limit = 10,
    // applyFilters,
    // changeSorting
  } = useSchoolsList();

  // Get mutation functions from the mutations hook
  const { 
    delete: removeSchool,
    isDeleting,
    // isCreating
  } = useSchoolsMutations();

  // Use local state for performance mode instead
  // const [performanceMode, setPerformanceMode] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // const togglePerformanceMode = useCallback(() => {
  //   setPerformanceMode(prev => !prev);
  // }, []);

  // const [searchInput, setSearchInput] = useState("");

  // const handleSearch = useCallback((value: string) => {
  //   applyFilters({ schoolName: value });
  //   setSearchInput(value);
  // }, [applyFilters]);
  
  const handleDeleteSchool = async (id: string) => {
    try {
      if (removeSchool) {
        removeSchool(id);
      }
    } catch (error) {
      console.error("Failed to delete school:", error);
    }
  };

  if (loading) return <Text textSize="base">Loading Schools...</Text>;
  if (schoolError) return <Text textSize="base" color="danger">Error loading schools: {schoolError.message}</Text>;

  return (
    <DashboardPage>
      {/* Header with Create School button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schools</h1>
          <p className="text-gray-600">Manage and track schools across your district.</p>
        </div>
        <Button
          intent="primary"
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2"
        >
          <BuildingLibraryIcon className="h-5 w-5" />
          Create School
        </Button>
      </div>

      {/* <ResourceHeader<SchoolInput>
        page={page}
        total={total}
        limit={limit}
        setPage={setPage}
        sortOptions={[
          { key: "schoolName", label: "School Name" },
          { key: "district", label: "District" }
        ]}
        onSort={(field, order) => changeSorting(field as string, order)}
        onSearch={handleSearch}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        performanceMode={performanceMode}
        togglePerformanceMode={togglePerformanceMode}
      /> */}

      <EmptyListWrapper 
        items={schools} 
        resourceName="schools"
        title="No schools found"
        description="Get started by creating your first school"
        icon={BuildingLibraryIcon}
        action={
          <Button
            intent="primary"
            onClick={() => setShowCreateDialog(true)}
          >
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            Create Your First School
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school: School) => (
            <SchoolCard
              key={school._id}
              school={school}
              onDelete={handleDeleteSchool}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      </EmptyListWrapper>

      <CreateSchoolDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />

      {/* <div className="mt-8">
        <GenericResourceForm
          mode="create"
          title="Add School"
          onSubmit={createSchool}
          fields={SchoolFieldConfig as Field[]}
        />
        <BulkUploadForm
          title="Bulk Upload Schools"
          description="Upload a CSV file with school data"
          onUpload={uploadSchoolFile}
        />
      </div> */}
    </DashboardPage>
  );
}