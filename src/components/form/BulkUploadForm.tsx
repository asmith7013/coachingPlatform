"use client";

import { useState } from "react";

interface BulkUploadFormProps {
  title: string;
  description?: string;
  onUpload: (file: File) => Promise<string>;
  accept?: string;
  disabled?: boolean;
}

export default function BulkUploadForm({
  title,
  description,
  onUpload,
  accept = ".csv",
  disabled = false,
}: BulkUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      const uploadMessage = await onUpload(file);
      setMessage(uploadMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-8">
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 mb-2">{description}</p>
      )}
      <input 
        type="file" 
        accept={accept}
        onChange={handleFileChange} 
        className="block my-2"
        disabled={disabled || isUploading}
      />
      <button
        onClick={handleUpload}
        disabled={!file || isUploading || disabled}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>
      {message && (
        <div className={`mt-4 ${message.toLowerCase().includes("successful") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </div>
      )}
    </div>
  );
}
