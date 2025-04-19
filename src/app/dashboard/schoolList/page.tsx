"use client"; // ✅ Ensures this component runs on the client-side.

import React, { useState } from "react";
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { Button } from '@/components/ui/button';
import { useSchools } from "@/hooks/useSchools"; // ✅ SWR hook for managing Schools data.
import { School } from "@/lib/zod-schema"; // ✅ Import the School type from Zod schema.
import { SchoolInput } from "@/lib/zod-schema";
import { createSchool, uploadSchoolFile } from "@actions/schools/schools";
import { GenericAddForm } from "@/components/features/shared/form/GenericAddForm";
import BulkUploadForm from "@/components/features/shared/form/BulkUploadForm";
import { ResourceHeader } from "@/components/features/shared/ResourceHeader";
import { SchoolFieldConfig } from "@/lib/ui-schema/fieldConfig/core/school";
import { cn } from "@/lib/utils";

const createEmptySchool = (): SchoolInput => ({
  schoolNumber: "",
  district: "",
  schoolName: "",
  address: "",
  emoji: "",
  gradeLevelsSupported: [],
  staffList: [],
  schedules: [],
  cycles: [],
  owners: []
});

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
    changeSorting,
    performanceMode,
    togglePerformanceMode
  } = useSchools();

  const [searchInput, setSearchInput] = useState("");

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
    <div className="container mx-auto p-8">
      <Heading 
        level="h2" 
        color="default"
        className={cn("text-primary font-bold mb-4")}
      >
        Schools
      </Heading>
      
      <ResourceHeader<School>
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

      <div className="space-y-8">
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
      </div>

      <div className="mt-8">
        <GenericAddForm
          title="Add School"
          defaultValues={createEmptySchool()}
          onSubmit={createSchool}
          fields={SchoolFieldConfig}
        />
        <BulkUploadForm
          title="Bulk Upload Schools"
          description="Upload a CSV file with school data"
          onUpload={uploadSchoolFile}
        />
      </div>
    </div>
  );
}