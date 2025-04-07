"use client"; // ✅ Ensures this component runs on the client-side.

import React from "react";
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { Button } from '@/components/ui/button';
import { spacing, typography } from '@/lib/ui/tokens';
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
  // ✅ 5. Data Flow Integrity: Use `useSchools` to fetch, filter, paginate, and sort data.
  const { 
    schools, // ✅ Array of Schools retrieved from the database.
    loading, // ✅ Boolean indicating if data is currently loading.
    // error, // ✅ Stores any errors that occur during data fetching.
    page, // ✅ Current page for pagination.
    setPage, // ✅ Function to update the current page.
    limit, // ✅ Number of Schools displayed per page.
    total, // ✅ Total number of Schools available.
    removeSchool, // ✅ Function to delete a School.
    applyFilters, // ✅ Function to filter Schools dynamically.
    changeSorting, // ✅ Function to change sorting order.
    performanceMode, // ✅ Flag indicating whether performance optimizations are enabled.
    togglePerformanceMode // ✅ Function to toggle performance mode.
  } = useSchools();

  // ✅ 7. Optimistic Updates: Confirm and delete School using an SWR-based hook.
  const confirmDeleteSchool = (id: string) => {
    if (window.confirm("Are you sure you want to delete this school?")) {
      handleDeleteSchool(id);
    }
  };

  const handleDeleteSchool = async (id: string) => {
    await removeSchool(id);  // ✅ Calls the SWR mutate function to ensure an optimistic UI update.
  };

  // ✅ 6. Server Actions Error Handling: Display a loading indicator or handle errors.
  if (loading) return <Text>Loading Schools...</Text>;
  // if (error) return <p>Error: {error}</p>;

  return (
    <div className={cn('container mx-auto', spacing.lg)}>
      <Heading level="h2" className={cn(typography.weight.bold, 'text-primary', spacing.md)}>
        Schools
      </Heading>
      
      <div className="bg-primary text-white p-4 rounded-md mb-4">
        Example notification block
      </div>
      
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
        performanceMode={performanceMode}
        togglePerformanceMode={togglePerformanceMode}
      />

      <div className={spacing.lg}>
        {schools.map((school: School) => (
          <Card
            key={school._id}
            className={spacing.md}
            padding="md"
            radius="lg"
          >
            <div className="flex justify-between items-center">
              <div>
                <Heading level="h3" className={cn(typography.weight.medium, 'text-primary')}>
                  {school.emoji || '🏫'} {school.schoolName}
                </Heading>
                <Text variant="text" className={cn(spacing.sm, 'text-text-muted')}>
                  District: {school.district}
                </Text>
                {school.address && (
                  <Text variant="text" className={cn(spacing.sm, 'text-text-muted')}>
                    {school.address}
                  </Text>
                )}
              </div>
              <Button
                onClick={() => school._id && confirmDeleteSchool(school._id)}
                variant="danger"
                size="sm"
              >
                🗑️ Delete
              </Button>
            </div>
            <Heading level="h3" className={cn(typography.weight.medium, 'text-primary', spacing.md)}>
              Grade Levels
            </Heading>
            <div className="flex flex-wrap gap-2">
              {school.gradeLevelsSupported && school.gradeLevelsSupported.map((grade, index) => (
                <span 
                  key={index} 
                  className={cn(
                    spacing.sm,
                    'rounded-full text-sm',
                    typography.text.sm,
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

      <div className={spacing.lg}>
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