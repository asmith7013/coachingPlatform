"use client";

import { useState, useEffect } from "react";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import type { SavedSession } from "../../hooks/useWizardState";
import type { WizardStep } from "../../lib/types";

export type DraftViewState = "initial" | "drafts" | "new";

interface SavedDraftsProps {
  sessions: SavedSession[];
  currentSessionId: string | null;
  onSelectNew: () => void;
  onLoad: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onViewStateChange?: (viewState: DraftViewState) => void;
  isLoading?: boolean;
}

const STEP_LABELS: Record<WizardStep, string> = {
  1: "Step 1: Inputs",
  2: "Step 2: Analysis",
  3: "Step 3: Export",
};

const ITEMS_PER_PAGE = 10;

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

export function SavedDrafts({
  sessions,
  currentSessionId,
  onSelectNew,
  onLoad,
  onDelete,
  onViewStateChange,
  isLoading,
}: SavedDraftsProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [viewState, setViewState] = useState<DraftViewState>("initial");

  // When a session is loaded, reflect that in view state
  useEffect(() => {
    if (currentSessionId) {
      setViewState("drafts");
    }
  }, [currentSessionId]);

  // Notify parent when view state changes
  useEffect(() => {
    onViewStateChange?.(viewState);
  }, [viewState, onViewStateChange]);

  const totalPages = Math.ceil(sessions.length / ITEMS_PER_PAGE);
  const paginatedSessions = sessions.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE,
  );

  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Delete this draft?")) {
      onDelete(sessionId);
      // Reset to first page if current page becomes empty
      if (paginatedSessions.length === 1 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const handleSelectNew = () => {
    setViewState("new");
    onSelectNew();
  };

  const handleBack = () => {
    setViewState("initial");
    onSelectNew(); // Clear any selection
  };

  const hasDrafts = sessions.length > 0;

  // Initial choice view
  if (viewState === "initial") {
    // Show loading skeleton while drafts are being loaded
    if (isLoading) {
      return (
        <div className="space-y-2">
          {/* Skeleton for Create New Option */}
          <div className="w-full p-4 rounded-lg border-2 border-gray-200 bg-white animate-pulse">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gray-200 w-9 h-9" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-40 mb-1.5" />
                <div className="h-3 bg-gray-100 rounded w-48" />
              </div>
            </div>
          </div>
          {/* Skeleton for Continue Draft Option */}
          <div className="w-full p-4 rounded-lg border-2 border-gray-200 bg-white animate-pulse">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gray-200 w-9 h-9" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-1.5" />
                <div className="h-3 bg-gray-100 rounded w-36" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {/* Create New Option */}
        <button
          onClick={handleSelectNew}
          className="w-full text-left p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
              <PlusIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900 block">
                Create New Worked Example
              </span>
              <span className="text-xs text-gray-500">
                Start from scratch with a new lesson
              </span>
            </div>
          </div>
        </button>

        {/* Continue Draft Option - only show if there are drafts */}
        {hasDrafts && (
          <button
            onClick={() => setViewState("drafts")}
            className="w-full text-left p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                <DocumentTextIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900 block">
                  Continue Draft
                </span>
                <span className="text-xs text-gray-500">
                  {sessions.length} saved{" "}
                  {sessions.length === 1 ? "draft" : "drafts"} available
                </span>
              </div>
            </div>
          </button>
        )}
      </div>
    );
  }

  // Drafts list view
  if (viewState === "drafts") {
    return (
      <div className="space-y-3">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to options</span>
        </button>

        {/* Header with pagination */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Saved Drafts ({sessions.length})
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeftIcon className="w-4 h-4 text-gray-500" />
              </button>
              <span className="text-xs text-gray-500 tabular-nums">
                {currentPage + 1}/{totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={currentPage === totalPages - 1}
                className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRightIcon className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          )}
        </div>

        {/* Drafts list */}
        <div className="space-y-1.5">
          {paginatedSessions.map((session) => {
            const isSelected = currentSessionId === session.id;
            return (
              <div
                key={session.id}
                className={`group relative rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <button
                  onClick={() => onLoad(session.id)}
                  className="w-full text-left p-3 pr-8 cursor-pointer"
                >
                  {/* Lesson name */}
                  <div
                    className={`text-sm font-medium truncate ${isSelected ? "text-blue-900" : "text-gray-900"}`}
                  >
                    {session.lessonName}
                  </div>

                  {/* Meta info row */}
                  <div className="flex items-center gap-2 mt-1 text-xs flex-wrap">
                    {/* Grade/Unit/Lesson badges */}
                    <div className="flex gap-1">
                      {session.gradeLevel && (
                        <span
                          className={`px-1.5 py-0.5 rounded ${isSelected ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}
                        >
                          G{session.gradeLevel}
                        </span>
                      )}
                      {session.unitNumber && (
                        <span
                          className={`px-1.5 py-0.5 rounded ${isSelected ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}
                        >
                          U{session.unitNumber}
                        </span>
                      )}
                      {session.lessonNumber && (
                        <span
                          className={`px-1.5 py-0.5 rounded ${isSelected ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}
                        >
                          L{session.lessonNumber}
                        </span>
                      )}
                    </div>

                    <span className="text-gray-300">•</span>

                    {/* Step indicator */}
                    <span
                      className={isSelected ? "text-blue-600" : "text-gray-500"}
                    >
                      {STEP_LABELS[session.currentStep]}
                    </span>

                    <span className="text-gray-300">•</span>

                    {/* Time ago */}
                    <span className="text-gray-400">
                      {formatTimeAgo(session.savedAt)}
                    </span>
                  </div>
                </button>

                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(e, session.id)}
                  className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition-all cursor-pointer"
                  title="Delete draft"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // New lesson view - just show header, the actual dropdowns are in parent component
  return (
    <div className="space-y-3">
      {/* Back button - only show if there are drafts to go back to */}
      {hasDrafts && (
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to options</span>
        </button>
      )}

      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-full bg-blue-100 text-blue-600">
          <PlusIcon className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-gray-900">
          New Worked Example
        </span>
      </div>
    </div>
  );
}
