"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/fields/Input';
import { Alert } from '@/components/core/feedback/Alert';

interface ImportFormProps {
  onSubmit: (file: File, sheetName: string) => void;
  isLoading: boolean;
}

export function ImportForm({ onSubmit, isLoading }: ImportFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sheetName, setSheetName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile && sheetName) {
      onSubmit(selectedFile, sheetName);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isFormValid = selectedFile && sheetName;

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Import Student Skills from Roadmap Excel File
        </h2>
        <p className="text-sm text-gray-600">
          Upload an Excel file with mastered skills to update student records
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excel File
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={isLoading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
              {selectedFile && (
                <Button
                  type="button"
                  onClick={handleClearFile}
                  disabled={isLoading}
                  intent="secondary"
                  appearance="outline"
                  size="sm"
                >
                  Clear
                </Button>
              )}
            </div>
            {selectedFile && (
              <p className="mt-1 text-sm text-gray-500">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Sheet Name */}
          <Input
            label="Sheet Name (Section)"
            type="text"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            placeholder="803"
            required
            disabled={isLoading}
            helpText="Enter the name of the sheet tab (usually the section number)"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Expected Sheet Format</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>" <strong>Row 1, Column C:</strong> Metadata (Section | Teacher | Roadmap | Date)</li>
            <li>" <strong>Row 3, Starting Column I:</strong> Student names (LASTNAME, FIRSTNAME)</li>
            <li>" <strong>Column A, Row 4+:</strong> Skill numbers with Unit headers</li>
            <li>" <strong>Student columns:</strong> Mark &quot;PO&quot; for Passed Out (mastered skills)</li>
          </ul>
        </div>

        <Button
          type="submit"
          disabled={!isFormValid || isLoading}
          intent="primary"
          fullWidth
        >
          {isLoading ? 'Importing Skills...' : 'Import Student Skills'}
        </Button>
      </form>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">Important Notes</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>" Students matched by exact name format: &quot;LASTNAME, FIRSTNAME&quot;</li>
          <li>" New skills will be added to existing mastered skills (not replaced)</li>
          <li>" Only active students in the database will be updated</li>
          <li>" Accepts .xlsx and .xls Excel file formats</li>
        </ul>
      </div>
    </div>
  );
}
