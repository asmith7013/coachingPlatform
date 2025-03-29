"use client";

import React from "react";
import GenericAddForm from "@/components/form/GenericAddForm";
import BulkUploadForm from "@/components/form/BulkUploadForm";
import { ResourceHeader } from "@/components/ui/ResourceHeader";
import { useLookFors } from "@/hooks/useLookFors";
import { uploadLookForFile } from "@actions/lookFors/lookFors";
import { createLookFor } from "@actions/lookFors/lookFors";
import { LookForInput } from "@/lib/zod-schema/look-fors/look-for";
import { LookForFieldConfig } from "@/lib/ui-schema/fieldConfig/look-fors/look-for";

const createEmptyLookFor = (): LookForInput => ({
  lookForIndex: 0,
  schools: [],
  teachers: [],
  topic: "",
  description: "",
  studentFacing: "Yes",
  rubric: [],
  owners: [],
  category: "",
  status: "draft"
});

export default function LookForsWrapper() {
  // ✅ Use `useLookFors` hook for data management
  const { 
    lookFors, 
    loading, 
    page, 
    setPage, 
    limit, 
    total, 
    removeLookFor,
    applyFilters,
    changeSorting,
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

  if (loading) return <p>Loading LookFors...</p>;

  return (
    <div className="container mx-auto mt-8 p-6">
      <h2 className="text-2xl font-semibold mb-4">Look Fors</h2>

      <ResourceHeader<LookForInput>
        page={page}
        setPage={setPage}
        total={total}
        limit={limit}
        sortOptions={[
          { key: "topic", label: "Topic" }
        ]}
        onSort={(field, order) => {
          if (field === "topic") {
            changeSorting("topic", order);
          }
        }}
        onSearch={(value) => applyFilters({ topic: value })}
      />

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
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 mt-6">
        <GenericAddForm
          title="Add Look For"
          defaultValues={createEmptyLookFor()}
          onSubmit={createLookFor}
          fields={LookForFieldConfig}
        />
      </div>

      {/* ✅ Bulk Upload Component */}
      <BulkUploadForm
        title="Bulk Upload Look Fors"
        description="Upload a CSV file containing Look Fors and embedded rubric rows"
        onUpload={uploadLookForFile}
      />
    </div>
  );
}