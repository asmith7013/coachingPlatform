"use client"; // ✅ Ensures this component runs on the client-side.

import React from "react";
import { useNYCPSStaff } from "@/hooks/useNYCPSStaff"; // ✅ SWR hook for managing NYCPS Staff data.
import { NYCPSStaff } from "@/lib/zod-schema"; // ✅ Import the NYCPSStaff type from Zod schema.
import { NYCPSStaffInput } from "@/lib/zod-schema";
import { createNYCPSStaff, uploadNYCPSStaffFile } from "@actions/staff/nycps";
import GenericAddForm from "@/components/features/shared/form/GenericAddForm";
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
  if (loading) return <p>Loading NYCPS Staff...</p>;
  // if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mx-auto mt-8 p-6">
      <h2 className="text-2xl font-semibold mb-4">NYCPS Staff</h2>

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
      <div className="space-y-6">
        {staff.map((member: NYCPSStaff) => (
          <div key={member._id} className="bg-white shadow-lg rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="text-lg font-bold">{member.staffName}</h5>
                <p className="text-gray-700">{member.email || 'No email provided'}</p>
              </div>
              {/* ✅ Optimistic UI Update: Delete Button */}
              <button
                onClick={() => member._id && confirmDeleteStaff(member._id)}
                className="text-red-500 hover:bg-red-100 px-3 py-1 rounded"
              >
                🗑️ Delete
              </button>
            </div>

            {/* ✅ 15. Schema Nesting & Type Inference: Dynamically render roles and subjects */}
            <div className="mt-4">
              {/* Roles */}
              <h5 className="text-lg font-bold mb-2">Roles</h5>
              <div className="flex flex-wrap gap-2 mb-4">
                {member.rolesNYCPS && member.rolesNYCPS.map((role, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {role}
                  </span>
                ))}
              </div>

              {/* Subjects */}
              <h5 className="text-lg font-bold mb-2">Subjects</h5>
              <div className="flex flex-wrap gap-2">
                {member.subjects && member.subjects.map((subject, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-8">
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
