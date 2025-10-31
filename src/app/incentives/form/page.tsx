"use client";

import React, { useState, useEffect } from "react";
import { StudentGrid } from "./components/StudentGrid";
import { ManageColumnsModal } from "./components/ManageColumnsModal";
import { DetailCard, StudentDetailRow } from "./components/DetailCard";
import { InquiryPicker } from "./components/InquiryPicker";
import { LessonPicker } from "./components/LessonPicker";
import { SkillPicker } from "./components/SkillPicker";
import { CustomDetailInput } from "./components/CustomDetailInput";
import { useFormFilters, useFormDraft, useDebouncedSave } from "./hooks/useFormState";
import { useActivityTypes } from "./hooks/useActivityTypes";
import {
  fetchStudentsBySection,
  fetchUnitsByGrade,
  fetchSectionsForUnit,
  submitActivities,
  StudentActivitySubmission,
} from "./actions";
import { StudentActivity } from "@zod-schema/313/student";

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Unit {
  _id: string;
  unitNumber: number;
  unitTitle: string;
  grade: string;
}

export default function IncentivesFormPage() {
  // Form filters
  const { unitId, section, date, setUnitId, setSection, setDate, isLoaded: filtersLoaded } = useFormFilters();

  // Form draft state
  const {
    formState,
    lastSaved,
    isLoaded: draftLoaded,
    saveDraft,
    clearDraft,
    toggleCheckbox,
    updateDetail,
  } = useFormDraft(date);

  // Auto-save with debounce
  useDebouncedSave(formState, saveDraft);

  // Activity types
  const { activityTypes, reload: reloadActivityTypes } = useActivityTypes();

  // Data state
  const [students, setStudents] = useState<Student[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitSections, setUnitSections] = useState<string[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  // UI state
  const [isManageColumnsOpen, setIsManageColumnsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Load units on mount
  useEffect(() => {
    async function loadUnits() {
      const result = await fetchUnitsByGrade("8");
      if (typeof result !== 'string' && result.success && result.data) {
        setUnits(result.data as Unit[]);
      }
    }
    loadUnits();
  }, []);

  // Load students when section changes
  useEffect(() => {
    if (!section) {
      setStudents([]);
      return;
    }

    async function loadStudents() {
      const result = await fetchStudentsBySection(section, "8");
      if (typeof result !== 'string' && result.success && result.data) {
        setStudents(result.data as Student[]);
      }
    }
    loadStudents();
  }, [section]);

  // Load unit sections when unit changes
  useEffect(() => {
    if (!unitId) {
      setUnitSections([]);
      setSelectedUnit(null);
      return;
    }

    const unit = units.find((u) => u._id === unitId);
    setSelectedUnit(unit || null);

    if (unit) {
      const unitNumber = unit.unitNumber;
      async function loadSections() {
        const result = await fetchSectionsForUnit("8", unitNumber);
        if (typeof result !== 'string' && result.success && result.data) {
          setUnitSections(result.data as string[]);
        }
      }
      loadSections();
    }
  }, [unitId, units]);

  // Get students with checked activities for a specific activity type
  const getStudentsForActivityType = (activityTypeId: string) => {
    return students.filter((student) => formState[student._id]?.[activityTypeId]?.checked);
  };

  // Check if any student has this activity type checked
  const hasActivityTypeChecked = (activityTypeId: string) => {
    return students.some((student) => formState[student._id]?.[activityTypeId]?.checked);
  };

  // Validate form before submission
  const validateForm = (): string | null => {
    if (!unitId) return "Please select a unit";
    if (!section) return "Please select a section";
    if (!date) return "Please select a date";

    // Check each activity type that requires details
    for (const type of activityTypes) {
      if (!type.requiresDetails) continue;

      const studentsWithType = getStudentsForActivityType(type.id);
      for (const student of studentsWithType) {
        const detail = formState[student._id]?.[type.id]?.detail;
        if (!detail || detail.trim() === "") {
          return `Please provide details for ${student.firstName} ${student.lastName}'s ${type.label}`;
        }
      }
    }

    return null;
  };

  // Handle form submission
  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setSubmitMessage({ type: "error", message: validationError });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // Build submissions
      const submissions: StudentActivitySubmission[] = [];

      for (const student of students) {
        const studentActivities: Omit<StudentActivity, "createdAt">[] = [];

        for (const type of activityTypes) {
          const activityState = formState[student._id]?.[type.id];
          if (!activityState?.checked) continue;

          const activity: Omit<StudentActivity, "createdAt"> = {
            date,
            activityType: type.id,
            activityLabel: type.label,
            unitId: unitId,
          };

          // Add detail based on type
          if (type.requiresDetails && activityState.detail) {
            switch (type.detailType) {
              case "inquiry":
                activity.inquiryQuestion = activityState.detail;
                break;
              case "lesson":
                activity.lessonId = activityState.detail;
                break;
              case "skill":
                activity.skillId = activityState.detail;
                break;
              case "custom":
                activity.customDetail = activityState.detail;
                break;
            }
          }

          studentActivities.push(activity);
        }

        if (studentActivities.length > 0) {
          submissions.push({
            studentId: student._id,
            activities: studentActivities,
          });
        }
      }

      if (submissions.length === 0) {
        setSubmitMessage({ type: "error", message: "No activities to submit" });
        setIsSubmitting(false);
        return;
      }

      // Submit to server
      const result = await submitActivities(submissions, "Teacher Name"); // TODO: Get from auth

      if (typeof result === 'string') {
        setSubmitMessage({
          type: "error",
          message: "Failed to submit activities",
        });
      } else if (result.success && result.data) {
        const { successful, failed } = result.data;
        setSubmitMessage({
          type: "success",
          message: `✓ Logged activities for ${successful} student${successful !== 1 ? "s" : ""}${failed > 0 ? ` (${failed} failed)` : ""}`,
        });
        clearDraft();

        // Clear form after short delay
        setTimeout(() => {
          setSubmitMessage(null);
        }, 5000);
      } else {
        setSubmitMessage({
          type: "error",
          message: result.error ?? "Failed to submit activities",
        });
      }
    } catch (error) {
      setSubmitMessage({
        type: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build checkbox state for grid
  const checkedState = Object.fromEntries(
    students.map((student) => [
      student._id,
      Object.fromEntries(
        activityTypes.map((type) => [
          type.id,
          formState[student._id]?.[type.id]?.checked || false,
        ])
      ),
    ])
  );

  if (!filtersLoaded || !draftLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto space-y-6" style={{ maxWidth: "1600px" }}>
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Incentives Activity Tracker
            </h1>
            <button
              onClick={() => setIsManageColumnsOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Manage Columns
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Unit Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit *
              </label>
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select unit...</option>
                {units.map((unit) => (
                  <option key={unit._id} value={unit._id}>
                    {unit.unitTitle}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section *
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select section...</option>
                <option value="802">802</option>
                <option value="803">803</option>
                <option value="804">804</option>
                <option value="805">805</option>
              </select>
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Last Saved Indicator */}
          {lastSaved && (
            <div className="mt-4 text-sm text-gray-500">
              Draft saved at {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Grid and Detail Cards Side by Side */}
        {unitId && section && (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Student Grid */}
            <div className="col-span-7">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <StudentGrid
                  students={students}
                  activityTypes={activityTypes}
                  checkedState={checkedState}
                  onCheckboxChange={(studentId, activityTypeId, checked) => {
                    toggleCheckbox(studentId, activityTypeId, checked);
                  }}
                />
              </div>
            </div>

            {/* Right Column - Detail Cards */}
            <div className="col-span-5">
              <div className="space-y-4">
                {activityTypes
                  .filter(
                    (type) => type.requiresDetails && hasActivityTypeChecked(type.id)
                  )
                  .map((type) => {
                    const studentsWithType = getStudentsForActivityType(type.id);

                    return (
                      <DetailCard
                        key={type.id}
                        title={type.label}
                        icon={type.icon}
                        color={type.color}
                      >
                        {studentsWithType.map((student) => {
                          const detail = formState[student._id]?.[type.id]?.detail || "";

                          return (
                            <StudentDetailRow
                              key={student._id}
                              studentName={`${student.lastName}, ${student.firstName}`}
                            >
                              {type.detailType === "inquiry" && (
                                <InquiryPicker
                                  sections={unitSections}
                                  value={detail}
                                  onChange={(value) =>
                                    updateDetail(student._id, type.id, value)
                                  }
                                  required
                                />
                              )}
                              {type.detailType === "lesson" && selectedUnit && (
                                <LessonPicker
                                  grade="8"
                                  unitNumber={selectedUnit.unitNumber}
                                  value={detail}
                                  onChange={(value) =>
                                    updateDetail(student._id, type.id, value)
                                  }
                                  required
                                />
                              )}
                              {type.detailType === "skill" && (
                                <SkillPicker
                                  unitId={unitId}
                                  value={detail}
                                  onChange={(value) =>
                                    updateDetail(student._id, type.id, value)
                                  }
                                  required
                                />
                              )}
                              {type.detailType === "custom" && (
                                <CustomDetailInput
                                  value={detail}
                                  onChange={(value) =>
                                    updateDetail(student._id, type.id, value)
                                  }
                                  required
                                />
                              )}
                            </StudentDetailRow>
                          );
                        })}
                      </DetailCard>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {unitId && section && students.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                {submitMessage && (
                  <div
                    className={`px-4 py-2 rounded-md ${
                      submitMessage.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {submitMessage.message}
                  </div>
                )}
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? "Submitting..." : "Submit Activities"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manage Columns Modal */}
      <ManageColumnsModal
        isOpen={isManageColumnsOpen}
        onClose={() => setIsManageColumnsOpen(false)}
        activityTypes={activityTypes}
        onUpdate={reloadActivityTypes}
      />
    </div>
  );
}
