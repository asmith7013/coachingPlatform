"use client"

import { uploadSchoolFile } from "@actions/schools/schools";
import { useState } from "react";

export default function BulkUploadSchools(){
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files?.length) {
        setFile(event.target.files[0]);
      }
    };

    const handleUploadSchool = async () => {
        if (!file) return;
        
        try {
            const uploadMessage = await uploadSchoolFile(file);
            setMessage(uploadMessage);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "An error occurred during upload");
        }
    };
  
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold">Bulk Upload Schools</h3>
        <p className="text-sm text-gray-600 mb-2">Upload a CSV file with school data</p>
        <input type="file" accept=".csv" onChange={handleFileChange} className="block my-2" />
        <button
          onClick={handleUploadSchool}
          disabled={!file}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          Upload
        </button>
        {message && <div className="mt-4 text-gray-700">{message}</div>}
      </div>
    );
}; 