"use client";

import { useState } from "react";
import {
  FolderOpenIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/solid";
import { useToast } from "@/components/core/feedback/Toast";
import { CurriculumScanTab, ApiImportTab, JsonImportTab } from "./components";
import type { ImportMode } from "./components";

export default function QuestionMapperPage() {
  const [importMode, setImportMode] = useState<ImportMode>("curriculum");
  const { showToast, ToastComponent } = useToast();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6" style={{ maxWidth: "1400px" }}>
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">Podsie Question Mapper</h1>
          <p className="text-gray-600">
            Scan curriculum, export question maps to database, or import
            manually
          </p>
        </div>

        {/* Import Mode Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setImportMode("curriculum")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  importMode === "curriculum"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FolderOpenIcon className="w-4 h-4 inline mr-2" />
                Scan Curriculum
              </button>
              <button
                onClick={() => setImportMode("api")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  importMode === "api"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                From Podsie API
              </button>
              <button
                onClick={() => setImportMode("json")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  importMode === "json"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <DocumentArrowUpIcon className="w-4 h-4 inline mr-2" />
                From JSON
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {importMode === "curriculum" && (
          <CurriculumScanTab showToast={showToast} />
        )}

        {importMode === "api" && <ApiImportTab showToast={showToast} />}

        {importMode === "json" && <JsonImportTab showToast={showToast} />}

        <ToastComponent />
      </div>
    </div>
  );
}
