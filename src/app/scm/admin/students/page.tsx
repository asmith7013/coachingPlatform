"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { TablePagination } from "@/components/composed/tables/features/pagination";
import { useStudents } from "@hooks/scm/useStudents";
import { createStudent } from "@actions/scm/student/students";
import {
  createStudentDefaults,
  type Student,
} from "@zod-schema/scm/student/student";
import {
  Schools,
  AllSections,
  Sections313,
  SectionsPS19,
  SectionsX644,
  Teachers313,
  AllSectionsType,
  Teachers313Type,
} from "@schema/enum/scm";

// Grade options
const GRADE_OPTIONS = [
  { value: "", label: "All Grades" },
  { value: "6", label: "Grade 6" },
  { value: "7", label: "Grade 7" },
  { value: "8", label: "Grade 8" },
];

// Form state for creating a new student
interface StudentFormState {
  studentID: number;
  firstName: string;
  lastName: string;
  email: string;
  school: string;
  section: string;
  gradeLevel: string;
  teacher: string;
  active: boolean;
}

const initialFormState: StudentFormState = {
  studentID: 0,
  firstName: "",
  lastName: "",
  email: "",
  school: "IS313",
  section: "",
  gradeLevel: "",
  teacher: "",
  active: true,
};

// Editable metadata fields for inline editing
interface EditableMetadata {
  gradeLevel?: string;
  section?: string;
  teacher?: string;
  active?: boolean;
}

export default function ManageStudentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const gradeFilter = searchParams.get("grade") || "";
  const schoolFilter = searchParams.get("school") || "";
  const showInactive = searchParams.get("showInactive") === "true";

  // Data fetching
  const { items: students = [], isLoading } = useStudents.list({ limit: 1000 });
  const { updateWithToast } = useStudents.withNotifications();

  // Local state for edits
  const [editState, setEditState] = useState<Record<string, EditableMetadata>>(
    {},
  );
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<StudentFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Available options for inline editing dropdowns (deduplicated)
  const availableSections = useMemo(() => [...new Set(AllSections)], []);
  const availableTeachers = Teachers313;

  // Filter students
  const filteredStudents = useMemo(() => {
    let result = students;

    // Filter by grade
    if (gradeFilter) {
      result = result.filter((s) => s.gradeLevel === gradeFilter);
    }

    // Filter by school
    if (schoolFilter) {
      result = result.filter((s) => s.school === schoolFilter);
    }

    // Filter inactive unless showing them
    if (!showInactive) {
      result = result.filter((s) => s.active !== false);
    }

    // Sort by last name, first name
    return result.sort((a, b) => {
      const lastNameCompare = (a.lastName || "").localeCompare(
        b.lastName || "",
      );
      if (lastNameCompare !== 0) return lastNameCompare;
      return (a.firstName || "").localeCompare(b.firstName || "");
    });
  }, [students, gradeFilter, schoolFilter, showInactive]);

  // Paginated students
  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredStudents.slice(startIndex, startIndex + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [gradeFilter, schoolFilter, showInactive]);

  // Get current value (edited or original)
  const getValue = useCallback(
    <K extends keyof EditableMetadata>(
      student: (typeof students)[0],
      field: K,
    ): EditableMetadata[K] => {
      const edited = editState[student._id];
      if (edited && field in edited) {
        return edited[field];
      }
      return student[field as keyof typeof student] as EditableMetadata[K];
    },
    [editState],
  );

  // Check if row has unsaved changes
  const hasChanges = useCallback(
    (id: string) => {
      return id in editState && Object.keys(editState[id]).length > 0;
    },
    [editState],
  );

  // Handle field change
  const handleFieldChange = useCallback(
    (
      id: string,
      field: keyof EditableMetadata,
      value: EditableMetadata[keyof EditableMetadata],
    ) => {
      setEditState((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          [field]: value,
        },
      }));
      setSaveError(null);
      setSaveSuccess(null);
    },
    [],
  );

  // Handle save
  const handleSave = useCallback(
    async (id: string) => {
      const updates = editState[id];
      if (!updates || Object.keys(updates).length === 0) return;

      setSavingIds((prev) => new Set([...prev, id]));
      setSaveError(null);
      setSaveSuccess(null);

      try {
        // Cast section/teacher to proper types for the update
        const typedUpdates: Partial<Student> = {
          ...updates,
          section: updates.section as AllSectionsType | undefined,
          teacher: updates.teacher as Teachers313Type | undefined,
        };
        await updateWithToast(id, typedUpdates);
        // Clear edit state for this student
        setEditState((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setSaveSuccess("Changes saved successfully");
        setTimeout(() => setSaveSuccess(null), 3000);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Failed to save");
      } finally {
        setSavingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [editState, updateWithToast],
  );

  // URL param handlers
  const handleGradeChange = (grade: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (grade) {
      params.set("grade", grade);
    } else {
      params.delete("grade");
    }
    router.push(`/scm/admin/students?${params.toString()}`, { scroll: false });
  };

  const handleSchoolChange = (school: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (school) {
      params.set("school", school);
    } else {
      params.delete("school");
    }
    router.push(`/scm/admin/students?${params.toString()}`, { scroll: false });
  };

  const toggleShowInactive = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (showInactive) {
      params.delete("showInactive");
    } else {
      params.set("showInactive", "true");
    }
    router.push(`/scm/admin/students?${params.toString()}`, { scroll: false });
  };

  // Get sections based on selected school for create form
  const getSectionsForSchool = (school: string) => {
    switch (school) {
      case "IS313":
        return [...Sections313];
      case "PS19":
        return [...SectionsPS19];
      case "X644":
        return [...SectionsX644];
      default:
        return [];
    }
  };

  // Handle form field change
  const handleFormChange = (
    field: keyof StudentFormState,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // Reset section when school changes
      ...(field === "school" ? { section: "" } : {}),
    }));
  };

  // Open modal for creating a new student
  const openCreateModal = () => {
    setEditingStudentId(null);
    setFormData(initialFormState);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for editing an existing student
  const openEditModal = (student: Student) => {
    setEditingStudentId(student._id);
    setFormData({
      studentID: student.studentID,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      school: student.school,
      section: student.section,
      gradeLevel: student.gradeLevel || "",
      teacher: student.teacher || "",
      active: student.active,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Close modal and reset state
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudentId(null);
    setFormData(initialFormState);
    setFormError(null);
  };

  // Handle form submit (create or update)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingStudentId) {
        // Update existing student
        const updateData: Partial<Student> = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          school: formData.school as "IS313" | "PS19" | "X644",
          section: formData.section as AllSectionsType,
          gradeLevel: formData.gradeLevel || undefined,
          ...(formData.teacher
            ? { teacher: formData.teacher as Teachers313Type }
            : {}),
          active: formData.active,
        };

        await updateWithToast(editingStudentId, updateData);
        closeModal();
        setSaveSuccess("Student updated successfully");
        setTimeout(() => setSaveSuccess(null), 3000);
      } else {
        // Create new student
        const studentInput = createStudentDefaults({
          studentID: formData.studentID,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          school: formData.school as "IS313" | "PS19" | "X644",
          section: formData.section as AllSectionsType,
          gradeLevel: formData.gradeLevel || undefined,
          ...(formData.teacher
            ? { teacher: formData.teacher as Teachers313Type }
            : {}),
          active: formData.active,
        });

        const result = await createStudent(studentInput);

        if (result.success) {
          closeModal();
          queryClient.invalidateQueries({
            queryKey: ["entities", "list", "students"],
          });
          setSaveSuccess("Student created successfully");
          setTimeout(() => setSaveSuccess(null), 3000);
        } else {
          setFormError(result.error || "Failed to create student");
        }
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Manage Students
          </h1>
          <p className="text-gray-600">View and edit student information</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <PlusIcon className="w-5 h-5" />
            Add Student
          </button>
          <Link
            href="/scm"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to SCM
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {GRADE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleGradeChange(opt.value)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer ${
                gradeFilter === opt.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <select
          value={schoolFilter}
          onChange={(e) => handleSchoolChange(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white cursor-pointer"
        >
          <option value="">All Schools</option>
          {Schools.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={toggleShowInactive}
            className="rounded border-gray-300"
          />
          Show inactive
        </label>
      </div>

      {/* Status messages */}
      {saveError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <ExclamationTriangleIcon className="w-5 h-5" />
          {saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckIcon className="w-5 h-5" />
          {saveSuccess}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No students found
          {gradeFilter ? ` for Grade ${gradeFilter}` : ""}
          {schoolFilter ? ` in ${schoolFilter}` : ""}.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 text-left font-medium text-gray-700 w-24">
                  ID
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-700">
                  Name
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-700 w-24">
                  School
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-700 w-24">
                  Grade
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-700 w-32">
                  Section
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-700 w-40">
                  Teacher
                </th>
                <th className="px-3 py-3 text-center font-medium text-gray-700 w-20">
                  Active
                </th>
                <th className="px-3 py-3 text-right font-medium text-gray-700 w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedStudents.map((student) => {
                const isSaving = savingIds.has(student._id);
                const isInactive = student.active === false;
                const changed = hasChanges(student._id);

                return (
                  <tr
                    key={student._id}
                    className={`${
                      isInactive ? "bg-gray-50 opacity-60" : "bg-white"
                    } ${changed ? "bg-yellow-50" : ""}`}
                  >
                    {/* Student ID */}
                    <td className="px-3 py-2 text-gray-500">
                      {student.studentID}
                    </td>

                    {/* Name */}
                    <td className="px-3 py-2">
                      <div>
                        <span className="font-medium text-gray-900">
                          {student.lastName}, {student.firstName}
                        </span>
                        {student.email && (
                          <div className="text-xs text-gray-500">
                            {student.email}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* School */}
                    <td className="px-3 py-2 text-gray-600">
                      {student.school || "-"}
                    </td>

                    {/* Grade */}
                    <td className="px-3 py-2">
                      <select
                        value={
                          getValue(student, "gradeLevel") ??
                          student.gradeLevel ??
                          ""
                        }
                        onChange={(e) =>
                          handleFieldChange(
                            student._id,
                            "gradeLevel",
                            e.target.value,
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        disabled={isSaving}
                      >
                        <option value="">-</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                      </select>
                    </td>

                    {/* Section */}
                    <td className="px-3 py-2">
                      <select
                        value={
                          getValue(student, "section") ?? student.section ?? ""
                        }
                        onChange={(e) =>
                          handleFieldChange(
                            student._id,
                            "section",
                            e.target.value,
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        disabled={isSaving}
                      >
                        <option value="">-</option>
                        {availableSections.map((section) => (
                          <option key={section} value={section}>
                            {section}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Teacher */}
                    <td className="px-3 py-2">
                      <select
                        value={
                          getValue(student, "teacher") ?? student.teacher ?? ""
                        }
                        onChange={(e) =>
                          handleFieldChange(
                            student._id,
                            "teacher",
                            e.target.value,
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        disabled={isSaving}
                      >
                        <option value="">-</option>
                        {availableTeachers.map((teacher) => (
                          <option key={teacher} value={teacher}>
                            {teacher}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Active */}
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={
                          getValue(student, "active") ?? student.active ?? true
                        }
                        onChange={(e) =>
                          handleFieldChange(
                            student._id,
                            "active",
                            e.target.checked,
                          )
                        }
                        className="rounded border-gray-300"
                        disabled={isSaving}
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(student)}
                          className="px-2 py-1 text-xs rounded cursor-pointer bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleSave(student._id)}
                          disabled={isSaving || !changed}
                          className={`px-2 py-1 text-xs rounded cursor-pointer ${
                            changed
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-100 text-gray-400"
                          } disabled:opacity-50`}
                        >
                          {isSaving ? (
                            <ArrowPathIcon className="w-3 h-3 animate-spin" />
                          ) : (
                            "Save"
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer with pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {paginatedStudents.length} of {filteredStudents.length}{" "}
          students
          {filteredStudents.length !== students.length &&
            ` (${students.length} total)`}
        </div>
        {totalPages > 1 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            textSize="sm"
          />
        )}
      </div>

      {/* Student Modal (Create/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={closeModal}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingStudentId ? "Edit Student" : "Add New Student"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleFormSubmit}>
                <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) =>
                          handleFormChange("firstName", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter first name"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) =>
                          handleFormChange("lastName", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter last name"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Student ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.studentID || ""}
                        onChange={(e) =>
                          handleFormChange(
                            "studentID",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter student ID"
                        disabled={isSubmitting || !!editingStudentId}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          handleFormChange("email", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="student@example.com"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        School <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.school}
                        onChange={(e) =>
                          handleFormChange("school", e.target.value)
                        }
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                        disabled={isSubmitting}
                      >
                        {Schools.map((school) => (
                          <option key={school} value={school}>
                            {school}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.section}
                        onChange={(e) =>
                          handleFormChange("section", e.target.value)
                        }
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                        disabled={isSubmitting}
                      >
                        <option value="">Select section...</option>
                        {getSectionsForSchool(formData.school).map(
                          (section) => (
                            <option key={section} value={section}>
                              {section}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grade Level <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.gradeLevel}
                        onChange={(e) =>
                          handleFormChange("gradeLevel", e.target.value)
                        }
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                        disabled={isSubmitting}
                      >
                        <option value="">Select grade...</option>
                        <option value="6">6th Grade</option>
                        <option value="7">7th Grade</option>
                        <option value="8">8th Grade</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teacher <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.teacher}
                        onChange={(e) =>
                          handleFormChange("teacher", e.target.value)
                        }
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                        disabled={isSubmitting}
                      >
                        <option value="">Select teacher...</option>
                        {Teachers313.map((teacher) => (
                          <option key={teacher} value={teacher}>
                            {teacher}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) =>
                        handleFormChange("active", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="active" className="text-sm text-gray-700">
                      Active student
                    </label>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting
                      ? editingStudentId
                        ? "Saving..."
                        : "Creating..."
                      : editingStudentId
                        ? "Save Changes"
                        : "Create Student"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
