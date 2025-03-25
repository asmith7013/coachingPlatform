"use client"; // Ensures this component runs on the client-side.

import React from "react";
import { useSchools } from "@/hooks/useSchools"; // Import the custom hook for managing schools.
import AddSchoolForm from "@/components/schools/AddSchoolForm"; // Component for adding new schools.
import BulkUploadSchools from "@/components/schools/BulkUploadSchools"; // Component for bulk uploading schools.

export default function SchoolList() {
  const {
    schools,
    loading,
    // error,
    page,
    setPage,
    limit,
    // setLimit,
    total,
    applyFilters,
    // changeSorting,
  } = useSchools();

  if (loading) return <p>Loading Schools...</p>;

  return (
    <div className="container mx-auto mt-8 p-6">
      <h2 className="text-2xl font-semibold mb-4">Schools</h2>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mb-4">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          ⬅️ Previous
        </button>
        <span>Page {page} of {Math.ceil(total / limit)}</span>
        <button disabled={schools.length < limit} onClick={() => setPage(page + 1)}>
          Next ➡️
        </button>

        {/* Sorting Dropdown */}
        {/* <select onChange={(e) => changeSorting("schoolName", e.target.value)}>
          <option value="asc">Sort A-Z</option>
          <option value="desc">Sort Z-A</option>
        </select> */}

        {/* Filtering Input */}
        <input
          type="text"
          placeholder="Search Schools..."
          onChange={(e) => applyFilters({ schoolName: e.target.value })}
        />
      </div>

      <div className="space-y-6">
        {schools.map((school) => (
          <div key={school._id} className="bg-white shadow-lg rounded-lg p-4">
            <h5 className="text-lg font-bold">{school.schoolName}</h5>
            <p>{school.district}</p>
            <p>{school.address}</p>
          </div>
        ))}
      </div>

      <AddSchoolForm /> {/* Form for adding new schools */}
      <BulkUploadSchools /> {/* Bulk Upload Component for schools */}
    </div>
  );
} 