"use client"; // ✅ Ensures this component runs on the client-side.

import React from "react";
import { useSchools } from "@/hooks/useSchools"; // ✅ SWR hook for managing Schools data.
import { School } from "@/lib/zod-schema"; // ✅ Import the School type from Zod schema.
import { SchoolInput } from "@/lib/zod-schema";
import { createSchool, uploadSchoolFile } from "@actions/schools/schools";
import GenericAddForm from "@/components/features/shared/form/GenericAddForm";
import BulkUploadForm from "@/components/features/shared/form/BulkUploadForm";
import { ResourceHeader } from "@/components/features/shared/ResourceHeader";
import { SchoolFieldConfig } from "@/lib/ui-schema/fieldConfig/core/school";

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
  if (loading) return <p>Loading Schools...</p>;
  // if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mx-auto mt-8 p-6">
      <h2 className="text-2xl font-semibold mb-4">Schools</h2>

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

      {/* ✅ 5. Data Flow Integrity: SWR ensures data consistency between UI and database */}
      <div className="space-y-6">
        {schools.map((school: School) => (
          <div key={school._id} className="bg-white shadow-lg rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="text-lg font-bold">
                  {school.emoji || '🏫'} {school.schoolName}
                </h5>
                <p className="text-gray-700">District: {school.district}</p>
                {school.address && <p className="text-gray-500">{school.address}</p>}
              </div>
              {/* ✅ Optimistic UI Update: Delete Button */}
              <button
                onClick={() => school._id && confirmDeleteSchool(school._id)}
                className="text-red-500 hover:bg-red-100 px-3 py-1 rounded"
              >
                🗑️ Delete
              </button>
            </div>

            {/* ✅ 15. Schema Nesting & Type Inference: Dynamically render nested Grade Levels */}
            <h5 className="text-lg font-bold mt-4">Grade Levels</h5>
            <div className="flex flex-wrap gap-2 mt-2">
              {school.gradeLevelsSupported && school.gradeLevelsSupported.map((grade, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {grade}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ✅ 15. Schema Nesting & Type Inference: Ensure Schools correctly reference nested schemas */}
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
  );
}