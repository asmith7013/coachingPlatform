"use client";

import React, { } from "react";
import AddLookForForm from "@/components/lookFors/add";
import BulkUploadLookFors from "@/components/lookFors/bulkUpload";
import { useLookFors } from "@/hooks/useLookFors";

export default function LookForsWrapper() {
  // ✅ Use `useLookFors` hook for data management
  const { 
    lookFors, 
    loading, 
    error, 
    page, 
    setPage, 
    limit, 
    // setLimit, 
    total, 
    removeLookFor,
    applyFilters,
    changeSorting,
    // performanceMode
  } = useLookFors();

  // ✅ Confirm and Delete LookFor using Hook
  const confirmDeleteLookFor = (id: string) => {
    if (window.confirm("Are you sure you want to delete this LookFor?")) {
      handleDeleteLookFor(id);
    }
  };

  const handleDeleteLookFor = async (id: string) => {
    await removeLookFor(id);  // ✅ Uses the hook instead of direct API calls
  };
  console.log("🔍 error terminal", error, 'error', lookFors, 'lookFors', loading, 'loading');
  if (loading) return <p>Loading LookFors...</p>;
  // if (error) return <p className="text-red-500">{error}</p>;

  // console.log("🔍 lookFors", lookFors, 'lookFors in page');
  return (
    <div className="container mx-auto mt-8 p-6">
      <h2 className="text-2xl font-semibold mb-4">Look Fors</h2>

      {/* ✅ Pagination Controls */}
      <div className="flex justify-between items-center mb-4">
        <button 
          disabled={page === 1} 
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          ⬅️ Previous
        </button>
        <span>Page {page} of {Math.ceil(total / limit)}</span>
        <button 
          disabled={lookFors.length < limit} 
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next ➡️
        </button>
        <select
          onChange={(e) => changeSorting("topic", e.target.value as "asc" | "desc")}
          className="px-3 py-1 border rounded-md"
        >
          <option value="asc">Sort A-Z</option>
          <option value="desc">Sort Z-A</option>
        </select>
        <input
          type="text"
          placeholder="Search Look Fors..."
          onChange={(e) => applyFilters({ topic: e.target.value })}
          className="border px-3 py-1 rounded-md"
        />
      </div>

      {/* ✅ Display LookFors */}
      <div className="space-y-6">
        {lookFors.map((lookFor) => (
          <div key={lookFor._id} className="bg-white shadow-lg rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="text-lg font-bold">
                  {lookFor.studentFacing ? "✏️" : "🍎"} {lookFor.topic}
                </h5>
                <p className="text-gray-700">{lookFor.description}</p>
              </div>
              <button
                onClick={() => lookFor._id && confirmDeleteLookFor(lookFor._id)}
                className="text-red-500 hover:bg-red-100 px-3 py-1 rounded"
              >
                🗑️ Delete
              </button>
            </div>

            {/* ✅ Display Rubric Dynamically */}
            <h5 className="text-lg font-bold mt-4">Rubric</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {lookFor.rubric.map((rubricItem, index) => (
                    <div key={index} className="p-3 rounded-lg shadow-md text-left bg-gray-100">
                    <h4 className="text-lg font-bold">
                        {rubricItem.category} ({rubricItem.score})
                    </h4>
                    <p className="mt-2">{rubricItem.content || "No description"}</p>
                    </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Add LookFor Form */}
      <AddLookForForm />

      {/* ✅ Bulk Upload Component */}
      <BulkUploadLookFors />
    </div>
  );
}