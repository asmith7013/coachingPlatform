"use client";

import { useState } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { Spinner } from "@/components/core/feedback/Spinner";
import {
  generateQuestionMapFromResponses,
  saveQuestionMap,
  getQuestionMap,
} from "@/app/actions/scm/podsie/podsie-question-map";
import { QuestionMapResults } from "./QuestionMapResults";
import type { PodsieQuestionMap, ExistingMapping } from "./types";

interface ShowToastParams {
  title: string;
  description: string;
  variant: "success" | "error" | "warning";
  icon: React.ComponentType<{ className?: string }>;
}

interface ApiImportTabProps {
  showToast: (params: ShowToastParams) => void;
}

export function ApiImportTab({ showToast }: ApiImportTabProps) {
  const [assignmentId, setAssignmentId] = useState("");
  const [email, setEmail] = useState("alex.smith@teachinglab.org");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [assignmentName, setAssignmentName] = useState("");
  const [questionMap, setQuestionMap] = useState<PodsieQuestionMap[]>([]);
  const [existingMapping, setExistingMapping] =
    useState<ExistingMapping | null>(null);

  // Reset state when assignment ID changes
  const handleAssignmentIdChange = (newId: string) => {
    setAssignmentId(newId);
    setAssignmentName("");
    setQuestionMap([]);
    setExistingMapping(null);
  };

  const handleCheckAndFetch = async () => {
    if (!assignmentId.trim()) {
      showToast({
        title: "Validation Error",
        description: "Please enter an assignment ID",
        variant: "error",
        icon: ExclamationTriangleIcon,
      });
      return;
    }

    setLoading(true);
    setQuestionMap([]);
    setAssignmentName("");
    setExistingMapping(null);

    try {
      // First, check for existing mapping
      const existingResult = await getQuestionMap(assignmentId.trim());

      if (existingResult.success && existingResult.data) {
        setExistingMapping({
          assignmentId: existingResult.data.assignmentId,
          assignmentName: existingResult.data.assignmentName,
        });
        showToast({
          title: "Existing Mapping Found",
          description: `Found existing mapping for: ${existingResult.data.assignmentName}`,
          variant: "warning",
          icon: ExclamationTriangleIcon,
        });
      }

      // Then, fetch fresh data from Podsie API
      const result = await generateQuestionMapFromResponses(
        assignmentId.trim(),
        email,
      );

      if (result.success && result.data) {
        setAssignmentName(result.data.assignmentName);
        setQuestionMap(result.data.questionMap);
        showToast({
          title: "Data Loaded",
          description: `Found ${result.data.totalQuestions} questions for ${result.data.assignmentName}`,
          variant: "success",
          icon: CheckCircleIcon,
        });
      } else {
        showToast({
          title: "Fetch Failed",
          description: result.error || "Failed to fetch responses",
          variant: "error",
          icon: ExclamationTriangleIcon,
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
      showToast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "error",
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!assignmentId.trim() || !assignmentName || questionMap.length === 0) {
      showToast({
        title: "Validation Error",
        description: "Please generate a question map first",
        variant: "error",
        icon: ExclamationTriangleIcon,
      });
      return;
    }

    // Confirm if overwriting existing
    if (existingMapping) {
      const confirmed = window.confirm(
        `This will overwrite the existing mapping for "${existingMapping.assignmentName}". Continue?`,
      );
      if (!confirmed) return;
    }

    setSaving(true);
    try {
      const result = await saveQuestionMap({
        assignmentId: assignmentId.trim(),
        assignmentName,
        questionMap,
        totalQuestions: questionMap.length,
        createdBy: email,
      });

      if (result.success) {
        showToast({
          title: existingMapping ? "Mapping Updated" : "Mapping Saved",
          description: `Successfully ${existingMapping ? "updated" : "saved"} question map for ${assignmentName}`,
          variant: "success",
          icon: CheckCircleIcon,
        });
        setExistingMapping({
          assignmentId: assignmentId.trim(),
          assignmentName,
        });
      } else {
        showToast({
          title: "Save Failed",
          description: result.error || "Failed to save question map",
          variant: "error",
          icon: ExclamationTriangleIcon,
        });
      }
    } catch (error) {
      console.error("Error saving question map:", error);
      showToast({
        title: "Error",
        description: "An unexpected error occurred while saving",
        variant: "error",
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Input Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Podsie Assignment ID
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={assignmentId}
                onChange={(e) => handleAssignmentIdChange(e.target.value)}
                placeholder="e.g., 19351"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={(e) => e.key === "Enter" && handleCheckAndFetch()}
              />
              <button
                onClick={handleCheckAndFetch}
                disabled={loading || !assignmentId.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {loading ? "Loading..." : "Load Assignment"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@teachinglab.org"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email of student who completed the assignment without variants
            </p>
          </div>

          {existingMapping && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Existing mapping found for &quot;
                {existingMapping.assignmentName}&quot;. Saving will overwrite
                it.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm p-12">
          <div className="flex justify-center items-center">
            <Spinner size="lg" variant="primary" />
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && questionMap.length > 0 && (
        <QuestionMapResults
          assignmentId={assignmentId}
          assignmentName={assignmentName}
          questionMap={questionMap}
          saving={saving}
          onSave={handleSave}
          showApiNote
        />
      )}

      {/* Empty State */}
      {!loading && questionMap.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-600">
            Enter an assignment ID and click &quot;Load Assignment&quot; to get
            started
          </p>
        </div>
      )}
    </>
  );
}
