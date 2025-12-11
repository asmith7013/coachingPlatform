"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { StudentGrid } from "./components/StudentGrid";
import { ManageColumnsModal } from "./components/ManageColumnsModal";
import { DetailCard, StudentDetailRow } from "./components/DetailCard";
import { InquiryPicker as _InquiryPicker } from "./components/InquiryPicker";
import { LessonPicker } from "./components/LessonPicker";
import { SkillPicker } from "./components/SkillPicker";
import { SmallGroupPicker, parseSmallGroupData } from "./components/SmallGroupPicker";
import { CustomDetailInput } from "./components/CustomDetailInput";
import { useFormFilters, useFormDraft, useDebouncedSave } from "./hooks/useFormState";
import { useActivityTypes } from "./hooks/useActivityTypes";
import {
  fetchStudentsBySection,
  fetchUnitsByGrade,
  fetchSectionsForUnit,
  fetchSectionConfig,
  submitActivities,
  StudentActivitySubmission,
} from "./actions";
import { StudentActivity } from "@zod-schema/313/student/student";
import { Spinner } from "@/components/core/feedback/Spinner";

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
  // Get current user from Clerk
  const { user } = useUser();

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
  const [_unitSections, _setUnitSections] = useState<string[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [scopeSequenceTag, setScopeSequenceTag] = useState<string | undefined>(undefined);

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

  // Load students and section config when section changes
  useEffect(() => {
    if (!section) {
      setStudents([]);
      setScopeSequenceTag(undefined);
      return;
    }

    async function loadStudentsAndConfig() {
      // Load students
      const studentsResult = await fetchStudentsBySection(section, "8");
      if (typeof studentsResult !== 'string' && studentsResult.success && studentsResult.data) {
        setStudents(studentsResult.data as Student[]);
      }

      // Load section config to get scopeSequenceTag
      const configResult = await fetchSectionConfig(section);
      if (typeof configResult !== 'string' && configResult.success && configResult.data) {
        setScopeSequenceTag(configResult.data.scopeSequenceTag);
      }
    }
    loadStudentsAndConfig();
  }, [section]);

  // Load unit sections when unit changes
  useEffect(() => {
    if (!unitId) {
      _setUnitSections([]);
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
          _setUnitSections(result.data as string[]);
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
      // Skip detail requirement for inquiry - lesson selection is optional
      if (type.detailType === "inquiry") continue;

      const studentsWithType = getStudentsForActivityType(type.typeId ?? "");
      for (const student of studentsWithType) {
        const detail = formState[student._id]?.[type.typeId ?? ""]?.detail;
        if (!detail || detail.trim() === "") {
          return `Please provide details for ${student.firstName} ${student.lastName}'s ${type.label}`;
        }

        // Special validation for small-group type
        if (type.detailType === "small-group") {
          const smallGroupData = parseSmallGroupData(detail);
          if (!smallGroupData || !smallGroupData.lessonId) {
            return `Please select a lesson for ${student.firstName} ${student.lastName}'s ${type.label}`;
          }
          if (smallGroupData.type === "prerequisite" && !smallGroupData.skillId) {
            return `Please select a prerequisite skill for ${student.firstName} ${student.lastName}'s ${type.label}`;
          }
        }
      }
    }

    return null;
  };

  // Handle form submission
  const handleSubmit = async () => {
    console.log("🟢 [handleSubmit] Starting submission...");

    const validationError = validateForm();
    if (validationError) {
      console.log("❌ [handleSubmit] Validation error:", validationError);
      setSubmitMessage({ type: "error", message: validationError });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // Build submissions
      const submissions: StudentActivitySubmission[] = [];
      console.log("🟢 [handleSubmit] Building submissions", {
        studentCount: students.length,
        activityTypeCount: activityTypes.length,
        date,
        unitId
      });

      for (const student of students) {
        const studentActivities: Omit<StudentActivity, "createdAt">[] = [];

        for (const type of activityTypes) {
          const activityState = formState[student._id]?.[type.typeId ?? ""];
          if (!activityState?.checked) continue;

          console.log("🟢 [handleSubmit] Type object:", type);
          console.log("🟢 [handleSubmit] Adding activity", {
            student: `${student.firstName} ${student.lastName}`,
            studentId: student._id,
            activityType: type.typeId ?? "",
            activityLabel: type.label,
            detail: activityState.detail
          });

          const activity: Omit<StudentActivity, "createdAt"> = {
            date,
            activityType: type.typeId ?? "",
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
                // Store the lesson ID - the backend will resolve the lesson name
                activity.lessonId = activityState.detail;
                break;
              case "skill":
                activity.skillId = activityState.detail;
                break;
              case "small-group": {
                // Parse JSON data from SmallGroupPicker
                const smallGroupData = parseSmallGroupData(activityState.detail);
                if (smallGroupData) {
                  activity.lessonId = smallGroupData.lessonId;
                  activity.smallGroupType = smallGroupData.type;
                  if (smallGroupData.type === "prerequisite" && smallGroupData.skillId) {
                    activity.skillId = smallGroupData.skillId;
                  }
                }
                break;
              }
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

      console.log("🟢 [handleSubmit] Total submissions built:", submissions.length);

      if (submissions.length === 0) {
        console.log("❌ [handleSubmit] No activities to submit");
        setSubmitMessage({ type: "error", message: "No activities to submit" });
        setIsSubmitting(false);
        return;
      }

      // Submit to server
      console.log("🟢 [handleSubmit] Calling submitActivities...");
      const teacherName = user?.fullName || user?.firstName || user?.emailAddresses[0]?.emailAddress || "Unknown";
      const result = await submitActivities(submissions, teacherName);
      console.log("🟢 [handleSubmit] submitActivities result:", result);

      if (typeof result === 'string') {
        console.log("❌ [handleSubmit] Result is string:", result);
        setSubmitMessage({
          type: "error",
          message: "Failed to submit activities",
        });
      } else if (result.success && result.data) {
        const { successful, failed } = result.data;
        console.log("✅ [handleSubmit] Success!", { successful, failed });
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
        console.log("❌ [handleSubmit] Failed with error:", result.error);
        setSubmitMessage({
          type: "error",
          message: result.error ?? "Failed to submit activities",
        });
      }
    } catch (error) {
      console.error("❌ [handleSubmit] Exception caught:", error);
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
          type.typeId,
          formState[student._id]?.[type.typeId ?? ""]?.checked || false,
        ])
      ),
    ])
  );

  if (!filtersLoaded || !draftLoaded) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner size="lg" variant="primary" />
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
              <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Student Activities</h2>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to clear all checkboxes?")) {
                        clearDraft();
                      }
                    }}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex-1 min-h-0">
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
            </div>

            {/* Right Column - Detail Cards */}
            <div className="col-span-5">
              <div className="space-y-4">
                {activityTypes
                  .filter(
                    (type) => type.requiresDetails && hasActivityTypeChecked(type.typeId ?? "")
                  )
                  .map((type) => {
                    const studentsWithType = getStudentsForActivityType(type.typeId ?? "");

                    return (
                      <DetailCard
                        key={type.typeId || type.id}
                        title={type.label}
                        icon={type.icon}
                        color={type.color}
                      >
                        {studentsWithType.map((student) => {
                          const detail = formState[student._id]?.[type.typeId ?? ""]?.detail || "";

                          return (
                            <StudentDetailRow
                              key={student._id}
                              studentName={`${student.lastName}, ${student.firstName}`}
                              stacked={type.detailType === "small-group"}
                            >
                              {/* Inquiry lesson selection commented out - made optional
                              {type.detailType === "inquiry" && (
                                <InquiryPicker
                                  sections={unitSections}
                                  value={detail}
                                  onChange={(value) =>
                                    updateDetail(student._id, type.typeId ?? "", value)
                                  }
                                  required
                                />
                              )}
                              */}
                              {type.detailType === "lesson" && selectedUnit && (
                                <LessonPicker
                                  grade="8"
                                  unitNumber={selectedUnit.unitNumber}
                                  value={detail}
                                  onChange={(value) =>
                                    updateDetail(student._id, type.typeId ?? "", value)
                                  }
                                  required
                                  scopeSequenceTag={scopeSequenceTag}
                                />
                              )}
                              {type.detailType === "skill" && (
                                <SkillPicker
                                  unitId={unitId ?? ""}
                                  value={detail}
                                  onChange={(value) =>
                                    updateDetail(student._id, type.typeId ?? "", value)
                                  }
                                  required
                                />
                              )}
                              {type.detailType === "small-group" && selectedUnit && (
                                <SmallGroupPicker
                                  grade="8"
                                  unitNumber={selectedUnit.unitNumber}
                                  unitId={unitId ?? ""}
                                  value={detail}
                                  onChange={(value) =>
                                    updateDetail(student._id, type.typeId ?? "", value)
                                  }
                                  required
                                  scopeSequenceTag={scopeSequenceTag}
                                />
                              )}
                              {type.detailType === "custom" && (
                                <CustomDetailInput
                                  value={detail}
                                  onChange={(value) =>
                                    updateDetail(student._id, type.typeId ?? "", value)
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
                {isSubmitting ? "Submitting..." : `Submit Activities for ${(() => {
                  const today = new Date();
                  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                  const yesterday = new Date(today);
                  yesterday.setDate(yesterday.getDate() - 1);
                  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
                  if (date === todayStr) return "Today";
                  if (date === yesterdayStr) return "Yesterday";
                  return new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                })()}`}
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
