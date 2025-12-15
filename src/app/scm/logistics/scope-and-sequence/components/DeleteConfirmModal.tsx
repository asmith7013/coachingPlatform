"use client";

import React from "react";
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { ScopeAndSequence } from "@zod-schema/scm/scope-and-sequence/scope-and-sequence";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entry: ScopeAndSequence | null;
  isLoading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  entry,
  isLoading,
}: DeleteConfirmModalProps) {
  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2 text-red-600">
            <ExclamationTriangleIcon className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Delete Entry</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded cursor-pointer"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete this scope and sequence entry?
          </p>
          <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
            <p>
              <span className="font-medium">Grade:</span> {entry.grade}
            </p>
            <p>
              <span className="font-medium">Unit:</span> {entry.unit}
            </p>
            <p>
              <span className="font-medium">Lesson:</span> {entry.unitLessonId} - {entry.lessonName}
            </p>
          </div>
          <p className="text-red-600 text-sm mt-4">
            This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
