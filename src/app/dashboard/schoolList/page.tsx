"use client"; // ✅ Ensures this component runs on the client-side.

import React, { useState, useCallback, useEffect } from "react";
import { Card } from '@components/composed/cards/Card';
import { Heading } from '@components/core/typography/Heading';
import { Text } from '@components/core/typography/Text';
import { Button } from '@components/core/Button';
import { DashboardPage } from '@components/layouts/DashboardPage';
import { useSchools } from "@/hooks/domain/useSchools"; // ✅ SWR hook for managing Schools data.
import { School, SchoolInput } from "@domain-types/school"; // ✅ Import the School type from Zod schema.
import { createSchool, uploadSchoolFile } from "@actions/schools/schools";
import { Field, GenericResourceForm } from "@components/composed/forms/ResourceForm";
import BulkUploadForm from "@components/composed/forms/BulkUploadForm";
import { ResourceHeader } from "@components/shared/ResourceHeader";
import { SchoolFieldConfig } from "@ui-forms/fieldConfig/core/school";
import { cn } from "@ui/utils/formatters";
import { EmptyListWrapper } from '@components/shared/EmptyListWrapper';



export default function SchoolList() {
  const {
    schools,
    total,
    loading,
    error: schoolError,
    page,
    setPage,
    limit,
    removeSchool,
    applyFilters,
    changeSorting
  } = useSchools();

  // Use local state for performance mode instead
  const [performanceMode, setPerformanceMode] = useState(true);
  const togglePerformanceMode = useCallback(() => {
    setPerformanceMode(prev => !prev);
  }, []);

  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    if (schools && schools.length > 0) {
      console.log("=== SCHOOL ID INFORMATION ===");
      schools.forEach(school => {
        console.log(`School: ${school.schoolName} | Number: ${school.schoolNumber} | ID: ${school._id}`);
      });
      console.log("============================");
    }
  }, [schools]);
  
  const confirmDeleteSchool = (id: string) => {
    if (window.confirm("Are you sure you want to delete this school?")) {
      handleDeleteSchool(id);
    }
  };

  const handleDeleteSchool = async (id: string) => {
    await removeSchool(id);
  };

  if (loading) return <Text textSize="base">Loading Schools...</Text>;
  if (schoolError) return <Text textSize="base" color="danger">Error loading schools</Text>;

  return (
    <DashboardPage
      title="Schools"
      description="Manage and track schools across your district."
    >
      <ResourceHeader<SchoolInput>
        page={page}
        total={total}
        limit={limit}
        setPage={setPage}
        sortOptions={[
          { key: "schoolName", label: "School Name" },
          { key: "district", label: "District" }
        ]}
        onSort={(field, order) => changeSorting(field as keyof School, order)}
        onSearch={(value) => applyFilters({ schoolName: value })}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        performanceMode={performanceMode}
        togglePerformanceMode={togglePerformanceMode}
      />

      <EmptyListWrapper items={schools} resourceName="schools">
        {schools.map((school: School) => (
          <Card
            key={school._id}
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
                  {school.emoji || '🏫'} {school.schoolName}
                </Heading>
                <Text 
                  textSize="base" 
                  color="muted"
                  className="mt-2"
                >
                  District: {school.district}
                </Text>
                {school.address && (
                  <Text 
                    textSize="base" 
                    color="muted"
                    className="mt-2"
                  >
                    {school.address}
                  </Text>
                )}
              </div>
              <Button
                onClick={() => school._id && confirmDeleteSchool(school._id)}
                textSize="sm"
                padding="sm"
                className="text-danger"
              >
                🗑️ Delete
              </Button>
            </div>
            <Heading 
              level="h3" 
              color="default"
              className={cn("text-primary font-medium mt-4")}
            >
              Grade Levels
            </Heading>
            <div className="flex flex-wrap gap-2 mt-2">
              {school.gradeLevelsSupported && school.gradeLevelsSupported.map((grade, index) => (
                <span 
                  key={index} 
                  className={cn(
                    'rounded-full px-3 py-1',
                    'text-sm',
                    'text-white',
                    'bg-primary'
                  )}
                >
                  {grade}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </EmptyListWrapper>

      <div className="mt-8">
        <GenericResourceForm
          mode="create"
          title="Add School"
          onSubmit={createSchool}
          fields={SchoolFieldConfig as Field<SchoolInput>[]}
        />
        <BulkUploadForm
          title="Bulk Upload Schools"
          description="Upload a CSV file with school data"
          onUpload={uploadSchoolFile}
        />
      </div>
    </DashboardPage>
  );
}