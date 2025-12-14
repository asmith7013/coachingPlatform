"use client";

import React, { useState } from "react";
import { ActivityTypeConfig, ActivityTypeConfigInput, DetailType } from "@zod-schema/scm/incentives/activity-type-config";
import {
  createActivityType,
  updateActivityType,
  deleteActivityType,
} from "../actions";

interface ManageColumnsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityTypes: ActivityTypeConfig[];
  onUpdate: () => void;
}

interface FormData {
  label: string;
  icon: string;
  color: string;
  requiresDetails: boolean;
  detailType: DetailType;
}

/**
 * Modal for managing activity type columns
 */
export function ManageColumnsModal({
  isOpen,
  onClose,
  activityTypes,
  onUpdate,
}: ManageColumnsModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for new/edit activity type
  const [formData, setFormData] = useState<FormData>({
    label: "",
    icon: "📝",
    color: "#3b82f6",
    requiresDetails: false,
    detailType: "none",
  });

  if (!isOpen) return null;

  const handleClose = () => {
    setIsAdding(false);
    setEditingId(null);
    setError(null);
    setFormData({
      label: "",
      icon: "📝",
      color: "#3b82f6",
      requiresDetails: false,
      detailType: "none",
    });
    onClose();
  };

  const handleAdd = () => {
    if (activityTypes.length >= 10) {
      setError("Maximum of 10 activity types allowed");
      return;
    }
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      label: "",
      icon: "📝",
      color: "#3b82f6",
      requiresDetails: false,
      detailType: "none",
    });
    setError(null);
  };

  const handleEdit = (type: ActivityTypeConfig) => {
    if (type.isDefault) {
      setError("Cannot edit default activity types");
      return;
    }
    setEditingId(type.typeId ?? null);
    setIsAdding(false);
    setFormData({
      label: type.label ?? "",
      icon: type.icon ?? "📝",
      color: type.color ?? "#3b82f6",
      requiresDetails: type.requiresDetails ?? false,
      detailType: type.detailType ?? "none",
    });
    setError(null);
  };

  const handleDelete = async (typeId: string) => {
    const type = activityTypes.find((t) => t.typeId === typeId);
    if (type?.isDefault) {
      setError("Cannot delete default activity types");
      return;
    }

    if (!confirm("Are you sure you want to delete this activity type?")) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await deleteActivityType(typeId);

    if (typeof result !== 'string' && result.success) {
      onUpdate();
    } else {
      setError(typeof result !== 'string' && result.error ? result.error : "Failed to delete activity type");
    }

    setIsSubmitting(false);
  };

  const handleSaveNew = async () => {
    if (!formData.label || formData.label.trim() === "") {
      setError("Label is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const newType: ActivityTypeConfigInput = {
      label: formData.label,
      icon: formData.icon,
      color: formData.color,
      requiresDetails: formData.requiresDetails,
      detailType: formData.detailType,
      isDefault: false,
      order: activityTypes.length + 1,
      ownerIds: [],
    };

    const result = await createActivityType(newType);

    if (typeof result !== 'string' && result.success) {
      setIsAdding(false);
      setFormData({
        label: "",
        icon: "📝",
        color: "#3b82f6",
        requiresDetails: false,
        detailType: "none",
      });
      onUpdate();
    } else {
      setError(typeof result !== 'string' && result.error ? result.error : "Failed to create activity type");
    }

    setIsSubmitting(false);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !formData.label) {
      setError("Label is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const updates: Partial<ActivityTypeConfigInput> = {
      label: formData.label,
      icon: formData.icon,
      color: formData.color,
      requiresDetails: formData.requiresDetails,
      detailType: formData.detailType,
    };

    const result = await updateActivityType(editingId, updates);

    if (typeof result !== 'string' && result.success) {
      setEditingId(null);
      setFormData({
        label: "",
        icon: "📝",
        color: "#3b82f6",
        requiresDetails: false,
        detailType: "none",
      });
      onUpdate();
    } else {
      setError(typeof result !== 'string' && result.error ? result.error : "Failed to update activity type");
    }

    setIsSubmitting(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setError(null);
    setFormData({
      label: "",
      icon: "📝",
      color: "#3b82f6",
      requiresDetails: false,
      detailType: "none",
    });
  };

  const colorPresets = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#eab308", // yellow
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#ef4444", // red
    "#06b6d4", // cyan
  ];

  const emojiPresets = ["📝", "🔍", "🚀", "🎯", "⭐", "👥", "📊", "✅", "💡", "🎓"];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative z-10 w-full max-w-2xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Manage Activity Columns
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Activity Types List */}
            <div className="space-y-2 mb-4">
              {activityTypes.map((type, index) => (
                <div
                  key={type.typeId || type.id || `activity-type-${index}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {type.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {type.detailType !== "none" && `Details: ${type.detailType}`}
                        {type.isDefault && " • Default"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!type.isDefault && (
                      <>
                        <button
                          onClick={() => handleEdit(type)}
                          disabled={isSubmitting}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(type.typeId ?? "")}
                          disabled={isSubmitting}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {type.isDefault && (
                      <span className="px-3 py-1 text-sm text-gray-400">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add/Edit Form */}
            {(isAdding || editingId) && (
              <div className="border border-gray-300 rounded-md p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">
                  {isAdding ? "Add New Activity Type" : "Edit Activity Type"}
                </h3>

                {/* Label */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label *
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    maxLength={50}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Exit Ticket"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.label.length} / 50
                  </div>
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) =>
                        setFormData({ ...formData, icon: e.target.value })
                      }
                      maxLength={10}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl"
                    />
                    <span className="text-sm text-gray-500">or select:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {emojiPresets.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: emoji })}
                        className="text-2xl p-2 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colorPresets.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors cursor-pointer"
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Requires Details */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.requiresDetails}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requiresDetails: e.target.checked,
                          detailType: e.target.checked ? "custom" : "none",
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Requires Details
                    </span>
                  </label>
                </div>

                {/* Detail Type */}
                {formData.requiresDetails && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Detail Type
                    </label>
                    <select
                      value={formData.detailType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          detailType: e.target.value as DetailType,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="inquiry">Inquiry (nested questions)</option>
                      <option value="lesson">Lesson (from scope-and-sequence)</option>
                      <option value="skill">Skill (unit prerequisite skills)</option>
                      <option value="custom">Custom (text input)</option>
                    </select>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={isAdding ? handleSaveNew : handleSaveEdit}
                    disabled={isSubmitting || !formData.label}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              {activityTypes.length} / 10 activity types
            </div>
            <button
              onClick={handleAdd}
              disabled={isSubmitting || activityTypes.length >= 10}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Add New Type
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
