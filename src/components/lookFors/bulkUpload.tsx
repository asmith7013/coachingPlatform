"use client"

import { uploadLookForFile } from "@actions/lookFors/lookFors";
import { useState } from "react";

export default function BulkUploadLookFors(){
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files?.length) {
        setFile(event.target.files[0]);
      }
    };

    const handleUploadLookFor = async () => {
        if (!file) return;
        
        const uploadMessage = await uploadLookForFile(file);
        setMessage(uploadMessage);
    };
  
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold">Bulk Upload Look Fors</h3>
        <input type="file" accept=".csv" onChange={handleFileChange} className="block my-2" />
        <button
          onClick={handleUploadLookFor}
          disabled={!file}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          Upload
        </button>
        {message && <div className="mt-4 text-gray-700">{message}</div>}
      </div>
    );
};