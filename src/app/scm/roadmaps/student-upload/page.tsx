"use client";

import { useState } from 'react';
import { ImportForm } from './components/ImportForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { importStudentSkills } from './actions/import-student-skills';
import { ImportResponse } from './lib/types';

export default function StudentUploadPage() {
  const [response, setResponse] = useState<ImportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (file: File, sheetName: string) => {
    setIsLoading(true);
    setResponse(null);

    try {
      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Call server action
      const result = await importStudentSkills(arrayBuffer, sheetName);
      setResponse(result);
    } catch (error) {
      setResponse({
        success: false,
        totalStudentsProcessed: 0,
        successfulUpdates: 0,
        failedUpdates: 0,
        studentResults: [],
        errors: [error instanceof Error ? error.message : 'An unknown error occurred'],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setResponse(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Skills Upload</h1>
          <p className="mt-2 text-gray-600">
            Import mastered skills from roadmap Excel files to update student records
          </p>
        </div>

        <div className="space-y-8">
          {/* Import Form */}
          <ImportForm onSubmit={handleSubmit} isLoading={isLoading} />

          {/* Results Display */}
          {(response || isLoading) && (
            <ResultsDisplay response={response} isLoading={isLoading} onClear={handleClear} />
          )}
        </div>
      </div>
    </div>
  );
}
