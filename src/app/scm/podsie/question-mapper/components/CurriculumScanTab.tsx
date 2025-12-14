"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import { Spinner } from "@/components/core/feedback/Spinner";
import {
  getAllCurriculumAssignments,
  exportAllCurriculumQuestionMapsToDb,
  exportCurriculumQuestionMapToDb,
} from "@/app/actions/scm/curriculum-question-map";
import {
  listQuestionMaps,
  deleteQuestionMap,
} from "@/app/actions/scm/podsie-question-map";
import { CurriculumAssignmentsTable } from "./CurriculumAssignmentsTable";
import { SavedMapsTable } from "./SavedMapsTable";
import type {
  CurriculumAssignmentSummary,
  ExportQuestionMapResult,
  SavedQuestionMap,
} from "./types";

interface ShowToastParams {
  title: string;
  description: string;
  variant: "success" | "error" | "warning";
  icon: React.ComponentType<{ className?: string }>;
}

interface CurriculumScanTabProps {
  showToast: (params: ShowToastParams) => void;
}

export function CurriculumScanTab({ showToast }: CurriculumScanTabProps) {
  // Curriculum scan state
  const [curriculumAssignments, setCurriculumAssignments] = useState<
    CurriculumAssignmentSummary[]
  >([]);
  const [curriculumPath, setCurriculumPath] = useState("");
  const [scanningCurriculum, setScanningCurriculum] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);
  const [exportResults, setExportResults] = useState<ExportQuestionMapResult[]>(
    []
  );
  const [exportingPath, setExportingPath] = useState<string | null>(null);

  // Saved question maps state
  const [savedMaps, setSavedMaps] = useState<SavedQuestionMap[]>([]);
  const [loadingSavedMaps, setLoadingSavedMaps] = useState(false);
  const [deletingMapId, setDeletingMapId] = useState<string | null>(null);

  const loadSavedMaps = useCallback(async () => {
    setLoadingSavedMaps(true);
    try {
      const result = await listQuestionMaps();
      if (result.success && result.data) {
        setSavedMaps(result.data as SavedQuestionMap[]);
      }
    } catch (error) {
      console.error("Error loading saved maps:", error);
    } finally {
      setLoadingSavedMaps(false);
    }
  }, []);

  // Load saved maps on mount
  useEffect(() => {
    loadSavedMaps();
  }, [loadSavedMaps]);

  // Check if a curriculum assignment is already in the DB
  const isInDatabase = useCallback(
    (externalId: string) => {
      return savedMaps.some(
        (m) =>
          m.assignmentId === `curriculum:${externalId}` ||
          m.assignmentId === externalId
      );
    },
    [savedMaps]
  );

  // Scan curriculum repo
  const handleScanCurriculum = async () => {
    setScanningCurriculum(true);
    setCurriculumAssignments([]);
    setExportResults([]);

    try {
      const result = await getAllCurriculumAssignments();

      if (result.success && result.data) {
        setCurriculumAssignments(result.data.assignments);
        setCurriculumPath(result.data.curriculumPath);
        showToast({
          title: "Curriculum Scanned",
          description: `Found ${result.data.totalAssignments} assignments`,
          variant: "success",
          icon: CheckCircleIcon,
        });
      } else {
        showToast({
          title: "Scan Failed",
          description: result.error || "Failed to scan curriculum",
          variant: "error",
          icon: ExclamationTriangleIcon,
        });
      }
    } catch (error) {
      console.error("Error scanning curriculum:", error);
      showToast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "error",
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setScanningCurriculum(false);
    }
  };

  // Export all curriculum assignments to database
  const handleExportAll = async () => {
    if (curriculumAssignments.length === 0) {
      showToast({
        title: "No Assignments",
        description: "Please scan the curriculum first",
        variant: "error",
        icon: ExclamationTriangleIcon,
      });
      return;
    }

    setExportingAll(true);
    setExportResults([]);

    try {
      const result = await exportAllCurriculumQuestionMapsToDb();

      setExportResults(result.results);

      if (result.success) {
        showToast({
          title: "Export Complete",
          description: `Exported ${result.exported} question maps to database`,
          variant: "success",
          icon: CheckCircleIcon,
        });
      } else {
        showToast({
          title: "Export Partial",
          description: `Exported ${result.exported}, failed ${result.failed}`,
          variant: "warning",
          icon: ExclamationTriangleIcon,
        });
      }

      // Refresh saved maps
      await loadSavedMaps();
    } catch (error) {
      console.error("Error exporting:", error);
      showToast({
        title: "Export Failed",
        description: "An unexpected error occurred",
        variant: "error",
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setExportingAll(false);
    }
  };

  // Handler for individual export
  const handleExportSingle = async (assignment: CurriculumAssignmentSummary) => {
    setExportingPath(assignment.path);

    try {
      const result = await exportCurriculumQuestionMapToDb(assignment.path);

      if (result.success && result.data) {
        showToast({
          title: "Exported",
          description: `"${assignment.title}" has been exported to the database`,
          variant: "success",
          icon: CheckCircleIcon,
        });
        // Refresh saved maps
        await loadSavedMaps();
      } else {
        showToast({
          title: "Export Failed",
          description: result.error || "Failed to export",
          variant: "error",
          icon: ExclamationTriangleIcon,
        });
      }
    } catch (error) {
      console.error("Error exporting:", error);
      showToast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "error",
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setExportingPath(null);
    }
  };

  // Delete handler
  const handleDeleteMap = async (
    assignmentId: string,
    assignmentName: string
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the question map for "${assignmentName}"?`
    );
    if (!confirmed) return;

    setDeletingMapId(assignmentId);
    try {
      const result = await deleteQuestionMap(assignmentId);
      if (result.success) {
        showToast({
          title: "Deleted",
          description: `Question map for "${assignmentName}" has been deleted`,
          variant: "success",
          icon: CheckCircleIcon,
        });
        // Remove from local state
        setSavedMaps((prev) =>
          prev.filter((m) => m.assignmentId !== assignmentId)
        );
      } else {
        showToast({
          title: "Delete Failed",
          description: result.error || "Failed to delete question map",
          variant: "error",
          icon: ExclamationTriangleIcon,
        });
      }
    } catch (error) {
      console.error("Error deleting:", error);
      showToast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "error",
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setDeletingMapId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scan Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">
              Scan Curriculum Repository
            </h2>
            <p className="text-sm text-gray-500">
              Scans podsie-curriculum for assignments with question structure
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleScanCurriculum}
              disabled={scanningCurriculum}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              {scanningCurriculum ? (
                <>
                  <Spinner size="sm" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <ArrowPathIcon className="w-5 h-5" />
                  <span>Scan Curriculum</span>
                </>
              )}
            </button>
            {curriculumAssignments.length > 0 && (
              <button
                onClick={handleExportAll}
                disabled={exportingAll}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                {exportingAll ? (
                  <>
                    <Spinner size="sm" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>
                      Export All to Database ({curriculumAssignments.length})
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {curriculumPath && (
          <p className="text-xs text-gray-400 font-mono">
            Path: {curriculumPath}
          </p>
        )}
      </div>

      {/* Curriculum Assignments Found */}
      <CurriculumAssignmentsTable
        assignments={curriculumAssignments}
        exportResults={exportResults}
        exportingPath={exportingPath}
        isInDatabase={isInDatabase}
        onExportSingle={handleExportSingle}
      />

      {/* Saved Question Maps */}
      <SavedMapsTable
        savedMaps={savedMaps}
        loading={loadingSavedMaps}
        deletingMapId={deletingMapId}
        onRefresh={loadSavedMaps}
        onDelete={handleDeleteMap}
      />
    </div>
  );
}
