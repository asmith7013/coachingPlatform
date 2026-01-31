"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";
import {
  fetchPodsieScmGroups,
  updatePodsieScmGroup,
} from "@actions/scm/podsie/podsie-scm-group";

interface PacingEntry {
  podsieAssignmentId: number;
  assignmentTitle?: string;
  dueDate?: string | null;
  groupNumber?: number | null;
  groupLabel?: string;
  orderIndex?: number | null;
  zearnLessonCode?: string | null;
}

interface ScmGroupRecord {
  _id: string;
  podsieGroupId: number;
  podsieModuleId: number;
  assignments: PacingEntry[];
}

/**
 * Guess a Zearn lesson code from assignment title and module ID.
 * e.g. title "Lesson 3: Adding Fractions" with moduleId 294 (unit 4) → "G8 M4 L3"
 */
function guessZearnCode(title: string, _moduleId: number): string | null {
  // Common Podsie title patterns:
  // "Lesson 3: Topic Name"
  // "L3 - Topic Name"
  // "4.3 Topic Name" (module.lesson)
  const lessonMatch = title.match(/(?:lesson\s+)(\d+)/i);
  if (lessonMatch) {
    // We don't know the unit number from moduleId alone — moduleId is the Podsie module ID,
    // not the math unit number. Leave unit blank for now; user will need to confirm.
    return `G8 M? L${lessonMatch[1]}`;
  }

  // Try "L3" pattern
  const shortMatch = title.match(/\bL(\d+)\b/);
  if (shortMatch) {
    return `G8 M? L${shortMatch[1]}`;
  }

  // Try "X.Y" pattern where X is module, Y is lesson
  const dotMatch = title.match(/\b(\d+)\.(\d+)\b/);
  if (dotMatch) {
    return `G8 M${dotMatch[1]} L${dotMatch[2]}`;
  }

  return null;
}

export default function ZearnCodesPage() {
  const [records, setRecords] = useState<ScmGroupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterGroupId, setFilterGroupId] = useState("");

  // Track edited zearn codes per record: recordId → { assignmentId → code }
  const [editedCodes, setEditedCodes] = useState<
    Record<string, Record<number, string>>
  >({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPodsieScmGroups({
        page: 1,
        limit: 500,
        sortBy: "podsieGroupId",
        sortOrder: "asc",
        filters: {},
      });
      if (result.items) {
        setRecords(result.items as unknown as ScmGroupRecord[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const filteredRecords = filterGroupId
    ? records.filter(
        (r) => r.podsieGroupId === parseInt(filterGroupId, 10),
      )
    : records;

  // Only show records that have assignments
  const recordsWithAssignments = filteredRecords.filter(
    (r) => r.assignments && r.assignments.length > 0,
  );

  const distinctGroupIds = [
    ...new Set(records.map((r) => r.podsieGroupId)),
  ].sort((a, b) => a - b);

  const getCodeValue = (record: ScmGroupRecord, entry: PacingEntry): string => {
    const edited = editedCodes[record._id]?.[entry.podsieAssignmentId];
    if (edited !== undefined) return edited;
    return entry.zearnLessonCode || "";
  };

  const getPlaceholder = (entry: PacingEntry, record: ScmGroupRecord): string => {
    if (entry.zearnLessonCode) return "";
    if (entry.assignmentTitle) {
      const guess = guessZearnCode(entry.assignmentTitle, record.podsieModuleId);
      return guess || "";
    }
    return "";
  };

  const handleCodeChange = (
    recordId: string,
    assignmentId: number,
    value: string,
  ) => {
    setEditedCodes((prev) => ({
      ...prev,
      [recordId]: {
        ...prev[recordId],
        [assignmentId]: value,
      },
    }));
  };

  const handleSave = async (record: ScmGroupRecord) => {
    setSavingId(record._id);
    setError(null);
    setSuccess(null);

    try {
      const edits = editedCodes[record._id] || {};
      const updatedAssignments = record.assignments.map((entry) => {
        const editedCode = edits[entry.podsieAssignmentId];
        return {
          ...entry,
          zearnLessonCode:
            editedCode !== undefined
              ? editedCode || null
              : entry.zearnLessonCode || null,
        };
      });

      const result = await updatePodsieScmGroup(record._id, {
        assignments: updatedAssignments,
      });

      if (result.success) {
        setSuccess(
          `Saved Zearn codes for Group ${record.podsieGroupId} / Module ${record.podsieModuleId}`,
        );
        // Clear edits for this record
        setEditedCodes((prev) => {
          const next = { ...prev };
          delete next[record._id];
          return next;
        });
        await loadRecords();
      } else {
        setError(result.error || "Failed to save");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSavingId(null);
    }
  };

  const handleAutoPopulate = (record: ScmGroupRecord) => {
    const newEdits: Record<number, string> = {};
    for (const entry of record.assignments) {
      if (!entry.zearnLessonCode && entry.assignmentTitle) {
        const guess = guessZearnCode(
          entry.assignmentTitle,
          record.podsieModuleId,
        );
        if (guess) {
          newEdits[entry.podsieAssignmentId] = guess;
        }
      }
    }
    if (Object.keys(newEdits).length > 0) {
      setEditedCodes((prev) => ({
        ...prev,
        [record._id]: {
          ...prev[record._id],
          ...newEdits,
        },
      }));
    }
  };

  const hasEdits = (recordId: string): boolean => {
    return Object.keys(editedCodes[recordId] || {}).length > 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold">Zearn Lesson Codes</h1>
          <p className="text-gray-600 mt-1">
            Manage Zearn lesson code mappings for pacing assignments.
            {" "}
            <span className="text-gray-500">
              {records.length} records, {distinctGroupIds.length} groups
            </span>
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Filter by Group ID:
            </label>
            <select
              value={filterGroupId}
              onChange={(e) => setFilterGroupId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Groups ({distinctGroupIds.length})</option>
              {distinctGroupIds.map((id) => (
                <option key={id} value={id}>
                  Group {id}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-500">
              Showing {recordsWithAssignments.length} records with assignments
            </span>
          </div>
        </div>

        {/* Records */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
            Loading...
          </div>
        ) : recordsWithAssignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
            No records with assignments found.
          </div>
        ) : (
          <div className="space-y-6">
            {recordsWithAssignments.map((record) => (
              <div
                key={record._id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                {/* Record header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold">
                      Group {record.podsieGroupId}
                    </span>
                    <span className="text-sm text-gray-500">
                      Module {record.podsieModuleId}
                    </span>
                    <span className="text-xs text-gray-400">
                      {record.assignments.length} assignments
                    </span>
                  </div>
                  <button
                    onClick={() => handleAutoPopulate(record)}
                    className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    Auto-populate
                  </button>
                </div>

                {/* Assignments table */}
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-24">
                        ID
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Title
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-16">
                        Group
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-48">
                        Zearn Code
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {record.assignments.map((entry) => (
                      <tr
                        key={entry.podsieAssignmentId}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-2 text-sm font-mono text-gray-600">
                          {entry.podsieAssignmentId}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {entry.assignmentTitle || (
                            <span className="text-gray-400 italic">
                              No title — save from pacing editor first
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {entry.groupNumber ?? "—"}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={getCodeValue(record, entry)}
                            placeholder={getPlaceholder(entry, record)}
                            onChange={(e) =>
                              handleCodeChange(
                                record._id,
                                entry.podsieAssignmentId,
                                e.target.value,
                              )
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Footer */}
                <div className="flex items-center justify-end px-4 py-3 bg-gray-50 border-t border-gray-200 gap-3">
                  {hasEdits(record._id) && (
                    <span className="text-xs text-amber-600 font-medium">
                      Unsaved changes
                    </span>
                  )}
                  <button
                    onClick={() => handleSave(record)}
                    disabled={
                      savingId === record._id || !hasEdits(record._id)
                    }
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                  >
                    <CheckIcon className="h-3.5 w-3.5" />
                    {savingId === record._id ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
