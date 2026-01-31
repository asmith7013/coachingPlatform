"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useWorkedExampleDecks, workedExampleDecksKeys } from "../hooks";
import {
  updateDeckMetadata,
  reactivateDeck,
} from "@/app/actions/worked-examples";
import type { WorkedExampleDeck } from "@zod-schema/scm/worked-example";

// Grade options matching viewer
const GRADE_OPTIONS = [
  { value: "", label: "All Grades" },
  { value: "6", label: "Grade 6" },
  { value: "7", label: "Grade 7" },
  { value: "8", label: "Grade 8" },
  { value: "Algebra 1", label: "Algebra 1" },
];

// Editable metadata fields
type GradeLevel = "6" | "7" | "8" | "Algebra 1";

interface EditableMetadata {
  title?: string;
  gradeLevel?: GradeLevel;
  unitNumber?: number | null;
  lessonNumber?: number | null;
  mathStandard?: string;
  isPublic?: boolean;
  podsieAssignmentId?: number | null;
}

interface PodsieAssignment {
  podsieAssignmentId: number;
  assignmentTitle: string;
}

export default function ManageWorkedExamples() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const gradeFilter = searchParams.get("grade") || "";
  const showDeactivated = searchParams.get("showDeactivated") === "true";

  // Data fetching
  const { decks, loading, error } = useWorkedExampleDecks();

  // Local state for edits
  const [editState, setEditState] = useState<Record<string, EditableMetadata>>(
    {},
  );
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Cache of Podsie assignments by "grade|unit" key
  const [assignmentCache, setAssignmentCache] = useState<
    Record<string, PodsieAssignment[]>
  >({});
  const [loadingAssignments, setLoadingAssignments] = useState<Set<string>>(
    new Set(),
  );

  const fetchAssignments = useCallback(
    async (gradeLevel: string, unitNumber: number) => {
      const cacheKey = `${gradeLevel}|${unitNumber}`;
      if (assignmentCache[cacheKey] || loadingAssignments.has(cacheKey)) return;

      setLoadingAssignments((prev) => new Set([...prev, cacheKey]));
      try {
        const res = await fetch(
          `/api/scm/podsie-assignments?gradeLevel=${encodeURIComponent(gradeLevel)}&unitNumber=${unitNumber}`,
        );
        const json = await res.json();
        if (json.success) {
          setAssignmentCache((prev) => ({
            ...prev,
            [cacheKey]: json.data,
          }));
        }
      } catch {
        // Silently fail - dropdown will just be empty
      } finally {
        setLoadingAssignments((prev) => {
          const next = new Set(prev);
          next.delete(cacheKey);
          return next;
        });
      }
    },
    [assignmentCache, loadingAssignments],
  );

  // Filter decks
  const filteredDecks = useMemo(() => {
    let result = decks;

    // Filter by grade
    if (gradeFilter) {
      result = result.filter((d) => d.gradeLevel === gradeFilter);
    }

    // Filter deactivated unless showing them
    if (!showDeactivated) {
      result = result.filter((d) => !d.deactivated);
    }

    // Sort by grade, unit, lesson
    return result.sort((a, b) => {
      const gradeCompare = (a.gradeLevel || "").localeCompare(
        b.gradeLevel || "",
      );
      if (gradeCompare !== 0) return gradeCompare;
      const unitCompare = (a.unitNumber || 0) - (b.unitNumber || 0);
      if (unitCompare !== 0) return unitCompare;
      return (a.lessonNumber || 0) - (b.lessonNumber || 0);
    });
  }, [decks, gradeFilter, showDeactivated]);

  // Get current value (edited or original)
  const getValue = useCallback(
    <K extends keyof EditableMetadata>(
      deck: WorkedExampleDeck,
      field: K,
    ): EditableMetadata[K] => {
      const edited = editState[deck.slug];
      if (edited && field in edited) {
        return edited[field];
      }
      return deck[field as keyof WorkedExampleDeck] as EditableMetadata[K];
    },
    [editState],
  );

  // Check if row has unsaved changes
  const hasChanges = useCallback(
    (slug: string) => {
      return slug in editState && Object.keys(editState[slug]).length > 0;
    },
    [editState],
  );

  // Handle field change
  const handleFieldChange = useCallback(
    (
      slug: string,
      field: keyof EditableMetadata,
      value: EditableMetadata[keyof EditableMetadata],
    ) => {
      setEditState((prev) => ({
        ...prev,
        [slug]: {
          ...prev[slug],
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
    async (slug: string) => {
      const updates = editState[slug];
      if (!updates || Object.keys(updates).length === 0) return;

      setSavingIds((prev) => new Set([...prev, slug]));
      setSaveError(null);
      setSaveSuccess(null);

      try {
        const result = await updateDeckMetadata(slug, updates);
        if (result.success) {
          // Clear edit state for this deck
          setEditState((prev) => {
            const next = { ...prev };
            delete next[slug];
            return next;
          });
          // Refresh data
          queryClient.invalidateQueries({
            queryKey: workedExampleDecksKeys.all,
          });
          setSaveSuccess(`Saved changes to "${slug}"`);
          setTimeout(() => setSaveSuccess(null), 3000);
        } else {
          setSaveError(result.error || "Failed to save");
        }
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Failed to save");
      } finally {
        setSavingIds((prev) => {
          const next = new Set(prev);
          next.delete(slug);
          return next;
        });
      }
    },
    [editState, queryClient],
  );

  // Handle reactivate
  const handleReactivate = useCallback(
    async (slug: string) => {
      setSavingIds((prev) => new Set([...prev, slug]));
      setSaveError(null);

      try {
        const result = await reactivateDeck(slug);
        if (result.success) {
          queryClient.invalidateQueries({
            queryKey: workedExampleDecksKeys.all,
          });
          setSaveSuccess(`Reactivated "${slug}"`);
          setTimeout(() => setSaveSuccess(null), 3000);
        } else {
          setSaveError(result.error || "Failed to reactivate");
        }
      } catch (err) {
        setSaveError(
          err instanceof Error ? err.message : "Failed to reactivate",
        );
      } finally {
        setSavingIds((prev) => {
          const next = new Set(prev);
          next.delete(slug);
          return next;
        });
      }
    },
    [queryClient],
  );

  // URL param handlers
  const handleGradeChange = (grade: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (grade) {
      params.set("grade", grade);
    } else {
      params.delete("grade");
    }
    router.push(`/scm/workedExamples/manage?${params.toString()}`, {
      scroll: false,
    });
  };

  const toggleShowDeactivated = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (showDeactivated) {
      params.delete("showDeactivated");
    } else {
      params.set("showDeactivated", "true");
    }
    router.push(`/scm/workedExamples/manage?${params.toString()}`, {
      scroll: false,
    });
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Manage Worked Examples
          </h1>
          <p className="text-gray-600">
            Edit metadata for worked example decks
          </p>
        </div>
        <Link
          href="/scm/workedExamples/viewer"
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Viewer
        </Link>
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
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showDeactivated}
            onChange={toggleShowDeactivated}
            className="rounded border-gray-300"
          />
          Show deactivated
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
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : filteredDecks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No decks found{gradeFilter ? ` for ${gradeFilter}` : ""}.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 text-left font-medium text-gray-700">
                  Title
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-700 w-24">
                  Grade
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-700 w-20">
                  Unit
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-700 w-20">
                  Lesson
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-700 w-32">
                  Standard
                </th>
                <th className="px-3 py-3 text-center font-medium text-gray-700 w-20">
                  Public
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-700 w-48">
                  Podsie Assignment
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-700 w-24">
                  Status
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-700 w-36">
                  Created
                </th>
                <th className="px-3 py-3 text-right font-medium text-gray-700 w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDecks.map((deck) => {
                const isSaving = savingIds.has(deck.slug);
                const isDeactivated = deck.deactivated;
                const changed = hasChanges(deck.slug);

                return (
                  <tr
                    key={deck.slug}
                    className={`${
                      isDeactivated ? "bg-gray-50 opacity-60" : "bg-white"
                    } ${changed ? "bg-yellow-50" : ""}`}
                  >
                    {/* Title */}
                    <td className="px-3 py-2">
                      {isDeactivated ? (
                        <span className="text-gray-500">{deck.title}</span>
                      ) : (
                        <input
                          type="text"
                          value={getValue(deck, "title") ?? deck.title}
                          onChange={(e) =>
                            handleFieldChange(
                              deck.slug,
                              "title",
                              e.target.value,
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      )}
                    </td>

                    {/* Grade */}
                    <td className="px-3 py-2">
                      {isDeactivated ? (
                        <span className="text-gray-500">{deck.gradeLevel}</span>
                      ) : (
                        <select
                          value={
                            getValue(deck, "gradeLevel") ?? deck.gradeLevel
                          }
                          onChange={(e) =>
                            handleFieldChange(
                              deck.slug,
                              "gradeLevel",
                              e.target.value as GradeLevel,
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="6">6</option>
                          <option value="7">7</option>
                          <option value="8">8</option>
                          <option value="Algebra 1">Algebra 1</option>
                        </select>
                      )}
                    </td>

                    {/* Unit */}
                    <td className="px-3 py-2">
                      {isDeactivated ? (
                        <span className="text-gray-500">
                          {deck.unitNumber ?? "-"}
                        </span>
                      ) : (
                        <input
                          type="number"
                          value={
                            getValue(deck, "unitNumber") ??
                            deck.unitNumber ??
                            ""
                          }
                          onChange={(e) =>
                            handleFieldChange(
                              deck.slug,
                              "unitNumber",
                              e.target.value ? parseInt(e.target.value) : null,
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          min="1"
                        />
                      )}
                    </td>

                    {/* Lesson */}
                    <td className="px-3 py-2">
                      {isDeactivated ? (
                        <span className="text-gray-500">
                          {deck.lessonNumber ?? "-"}
                        </span>
                      ) : (
                        <input
                          type="number"
                          value={
                            getValue(deck, "lessonNumber") ??
                            deck.lessonNumber ??
                            ""
                          }
                          onChange={(e) =>
                            handleFieldChange(
                              deck.slug,
                              "lessonNumber",
                              e.target.value ? parseInt(e.target.value) : null,
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      )}
                    </td>

                    {/* Standard */}
                    <td className="px-3 py-2">
                      {isDeactivated ? (
                        <span className="text-gray-500">
                          {deck.mathStandard || "-"}
                        </span>
                      ) : (
                        <input
                          type="text"
                          value={
                            getValue(deck, "mathStandard") ??
                            deck.mathStandard ??
                            ""
                          }
                          onChange={(e) =>
                            handleFieldChange(
                              deck.slug,
                              "mathStandard",
                              e.target.value,
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="e.g., 8.EE.8"
                        />
                      )}
                    </td>

                    {/* Public */}
                    <td className="px-3 py-2 text-center">
                      {isDeactivated ? (
                        <span className="text-gray-500">
                          {deck.isPublic ? "Yes" : "No"}
                        </span>
                      ) : (
                        <input
                          type="checkbox"
                          checked={
                            getValue(deck, "isPublic") ?? deck.isPublic ?? false
                          }
                          onChange={(e) =>
                            handleFieldChange(
                              deck.slug,
                              "isPublic",
                              e.target.checked,
                            )
                          }
                          className="rounded border-gray-300"
                        />
                      )}
                    </td>

                    {/* Podsie Assignment */}
                    <td className="px-3 py-2">
                      {isDeactivated ? (
                        <span className="text-gray-500 text-xs">
                          {deck.podsieAssignmentId ?? "—"}
                        </span>
                      ) : (
                        (() => {
                          const grade = (getValue(deck, "gradeLevel") ??
                            deck.gradeLevel) as string;
                          const unit = (getValue(deck, "unitNumber") ??
                            deck.unitNumber) as number | null | undefined;
                          const cacheKey =
                            grade && unit ? `${grade}|${unit}` : null;
                          const assignments = cacheKey
                            ? assignmentCache[cacheKey]
                            : null;
                          const currentVal =
                            getValue(deck, "podsieAssignmentId") ??
                            deck.podsieAssignmentId;

                          return (
                            <div className="flex items-center gap-1">
                              {grade && unit && !assignments ? (
                                <button
                                  onClick={() => fetchAssignments(grade, unit)}
                                  className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded cursor-pointer"
                                >
                                  {loadingAssignments.has(cacheKey!)
                                    ? "Loading..."
                                    : currentVal
                                      ? `#${currentVal}`
                                      : "Link"}
                                </button>
                              ) : assignments && assignments.length > 0 ? (
                                <select
                                  value={currentVal ?? ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      deck.slug,
                                      "podsieAssignmentId",
                                      e.target.value
                                        ? parseInt(e.target.value)
                                        : null,
                                    )
                                  }
                                  className="w-full px-1 py-1 border border-gray-200 rounded text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                >
                                  <option value="">None</option>
                                  {assignments.map((a) => (
                                    <option
                                      key={a.podsieAssignmentId}
                                      value={a.podsieAssignmentId}
                                    >
                                      {a.assignmentTitle}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-xs text-gray-400">
                                  {!grade || !unit
                                    ? "Set grade & unit"
                                    : currentVal
                                      ? `#${currentVal}`
                                      : "—"}
                                </span>
                              )}
                            </div>
                          );
                        })()
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2">
                      {isDeactivated ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                          Deactivated
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Created */}
                    <td className="px-3 py-2 text-gray-500 text-xs">
                      {deck.createdAt ? (
                        <>
                          <div>
                            {new Date(deck.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </div>
                          <div className="text-gray-400">
                            {new Date(deck.createdAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              },
                            )}
                          </div>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isDeactivated ? (
                          <button
                            onClick={() => handleReactivate(deck.slug)}
                            disabled={isSaving}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                          >
                            {isSaving ? (
                              <ArrowPathIcon className="w-3 h-3 animate-spin" />
                            ) : (
                              "Reactivate"
                            )}
                          </button>
                        ) : (
                          <>
                            <Link
                              href={`/scm/workedExamples/viewer?view=${deck.slug}`}
                              className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleSave(deck.slug)}
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
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer info */}
      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredDecks.length} of {decks.length} decks
      </div>
    </div>
  );
}
