"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckIcon,
  PlusIcon,
  PencilIcon,
  XMarkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  fetchPodsieScmModules,
  updatePodsieScmModule,
} from "@actions/scm/podsie/podsie-scm-module";
import {
  fetchPodsieScmGroups,
  createPodsieScmGroup,
  updatePodsieScmGroup,
  deletePodsieScmGroup,
} from "@actions/scm/podsie/podsie-scm-group";
import { Schools, SCOPE_SEQUENCE_TAG_OPTIONS } from "@schema/enum/scm";

interface PacingEntry {
  podsieAssignmentId: number;
  assignmentTitle?: string;
  dueDate?: string | null;
  groupNumber?: number | null;
  groupLabel?: string;
  orderIndex?: number | null;
  zearnLessonCode?: string | null;
}

interface ScmModuleRecord {
  _id: string;
  podsieGroupId: number;
  podsieModuleId: number;
  moduleName?: string | null;
  unitNumber?: number | null;
  assignments: PacingEntry[];
}

interface ScmGroupRecord {
  _id: string;
  podsieGroupId: number;
  groupName?: string | null;
  gradeLevel?: string | null;
  school?: string | null;
}

/**
 * Guess a Zearn lesson code from assignment title and module ID.
 * e.g. title "Lesson 3: Adding Fractions" with moduleId 294 (unit 4) → "G8 M4 L3"
 */
function guessZearnCode(title: string, _moduleId: number): string | null {
  const lessonMatch = title.match(/(?:lesson\s+)(\d+)/i);
  if (lessonMatch) {
    return `G8 M? L${lessonMatch[1]}`;
  }

  const shortMatch = title.match(/\bL(\d+)\b/);
  if (shortMatch) {
    return `G8 M? L${shortMatch[1]}`;
  }

  const dotMatch = title.match(/\b(\d+)\.(\d+)\b/);
  if (dotMatch) {
    return `G8 M${dotMatch[1]} L${dotMatch[2]}`;
  }

  return null;
}

export default function ModuleConfigPage() {
  const [records, setRecords] = useState<ScmModuleRecord[]>([]);
  const [groups, setGroups] = useState<ScmGroupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterGroupId, setFilterGroupId] = useState("");

  // Track edited zearn codes per record: recordId → { assignmentId → code }
  const [editedCodes, setEditedCodes] = useState<
    Record<string, Record<number, string>>
  >({});
  // Track edited unitNumber per record: recordId → unitNumber string
  const [editedUnitNumbers, setEditedUnitNumbers] = useState<
    Record<string, string>
  >({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // Create group form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupId, setNewGroupId] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGradeLevel, setNewGradeLevel] = useState("");
  const [newSchool, setNewSchool] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Edit group state
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupValues, setEditGroupValues] = useState<{
    groupName: string;
    gradeLevel: string;
    school: string;
  }>({ groupName: "", gradeLevel: "", school: "" });
  const [savingGroupId, setSavingGroupId] = useState<string | null>(null);
  const [showGroups, setShowGroups] = useState(false);
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    try {
      const result = await fetchPodsieScmGroups({
        page: 1,
        limit: 500,
        sortBy: "podsieGroupId",
        sortOrder: "asc",
        filters: {},
      });
      if (result.items) {
        const items = result.items as unknown as ScmGroupRecord[];
        setGroups(items);
      }
    } catch {
      // Groups are supplementary; don't block the page
    }
  }, []);

  // Derive name map from groups
  const groupNameMap: Record<number, string> = {};
  for (const g of groups) {
    if (g.groupName) {
      groupNameMap[g.podsieGroupId] = g.groupName;
    }
  }

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPodsieScmModules({
        page: 1,
        limit: 500,
        sortBy: "podsieGroupId",
        sortOrder: "asc",
        filters: {},
      });
      if (result.items) {
        setRecords(result.items as unknown as ScmModuleRecord[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
    loadGroups();
  }, [loadRecords, loadGroups]);

  const filteredRecords = filterGroupId
    ? records.filter((r) => r.podsieGroupId === parseInt(filterGroupId, 10))
    : records;

  // Only show records that have assignments
  const recordsWithAssignments = filteredRecords.filter(
    (r) => r.assignments && r.assignments.length > 0,
  );

  const distinctGroupIds = [
    ...new Set(records.map((r) => r.podsieGroupId)),
  ].sort((a, b) => a - b);

  const getGroupLabel = (id: number): string => {
    const name = groupNameMap[id];
    return name ? `${name} (${id})` : `Group ${id}`;
  };

  const getCodeValue = (
    record: ScmModuleRecord,
    entry: PacingEntry,
  ): string => {
    const edited = editedCodes[record._id]?.[entry.podsieAssignmentId];
    if (edited !== undefined) return edited;
    return entry.zearnLessonCode || "";
  };

  const getPlaceholder = (
    entry: PacingEntry,
    record: ScmModuleRecord,
  ): string => {
    if (entry.zearnLessonCode) return "";
    if (entry.assignmentTitle) {
      const guess = guessZearnCode(
        entry.assignmentTitle,
        record.podsieModuleId,
      );
      return guess || "";
    }
    return "";
  };

  const getUnitNumberValue = (record: ScmModuleRecord): string => {
    const edited = editedUnitNumbers[record._id];
    if (edited !== undefined) return edited;
    return record.unitNumber != null ? String(record.unitNumber) : "";
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

  const handleUnitNumberChange = (recordId: string, value: string) => {
    setEditedUnitNumbers((prev) => ({
      ...prev,
      [recordId]: value,
    }));
  };

  const handleSave = async (record: ScmModuleRecord) => {
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

      const unitNumStr = editedUnitNumbers[record._id];
      const unitNumberUpdate =
        unitNumStr !== undefined
          ? unitNumStr === ""
            ? { unitNumber: null }
            : { unitNumber: parseInt(unitNumStr, 10) }
          : {};

      const result = await updatePodsieScmModule(record._id, {
        assignments: updatedAssignments,
        ...unitNumberUpdate,
      });

      if (result.success) {
        setSuccess(
          `Saved config for ${getGroupLabel(record.podsieGroupId)} / Module ${record.podsieModuleId}`,
        );
        // Clear edits for this record
        setEditedCodes((prev) => {
          const next = { ...prev };
          delete next[record._id];
          return next;
        });
        setEditedUnitNumbers((prev) => {
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

  const handleAutoPopulate = (record: ScmModuleRecord) => {
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
    return (
      Object.keys(editedCodes[recordId] || {}).length > 0 ||
      editedUnitNumbers[recordId] !== undefined
    );
  };

  const handleStartEditGroup = (group: ScmGroupRecord) => {
    setEditingGroupId(group._id);
    setEditGroupValues({
      groupName: group.groupName || "",
      gradeLevel: group.gradeLevel || "",
      school: group.school || "",
    });
  };

  const handleSaveGroup = async (group: ScmGroupRecord) => {
    setSavingGroupId(group._id);
    setError(null);
    setSuccess(null);
    try {
      const result = await updatePodsieScmGroup(group._id, {
        groupName: editGroupValues.groupName || null,
        gradeLevel: editGroupValues.gradeLevel || null,
        school: editGroupValues.school || null,
      });
      if (result.success) {
        setSuccess(`Updated group ${editGroupValues.groupName || group.podsieGroupId}`);
        setEditingGroupId(null);
        await loadGroups();
      } else {
        setError(result.error || "Failed to update group");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update group");
    } finally {
      setSavingGroupId(null);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    setError(null);
    setSuccess(null);
    try {
      const result = await deletePodsieScmGroup(groupId);
      if (result.success) {
        setSuccess("Group deleted");
        setDeletingGroupId(null);
        await loadGroups();
      } else {
        setError(result.error || "Failed to delete group");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete group");
    }
  };

  const handleCreateGroup = async () => {
    const groupId = parseInt(newGroupId, 10);
    if (!groupId || isNaN(groupId)) {
      setError("Podsie Group ID is required");
      return;
    }
    if (!newSchool) {
      setError("School is required");
      return;
    }
    if (!newGradeLevel) {
      setError("Grade level is required");
      return;
    }

    setCreatingGroup(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await createPodsieScmGroup({
        podsieGroupId: groupId,
        groupName: newGroupName || null,
        gradeLevel: newGradeLevel || null,
        school: newSchool || null,
        ownerIds: [],
      });

      if (result.success) {
        setSuccess(`Created group ${newGroupName || groupId}`);
        setNewGroupId("");
        setNewGroupName("");
        setNewGradeLevel("");
        setNewSchool("");
        setShowCreateForm(false);
        await loadGroups();
      } else {
        setError(result.error || "Failed to create group");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setCreatingGroup(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold">Module Configuration</h1>
          <p className="text-gray-600 mt-1">
            Manage unit numbers and Zearn lesson code mappings for pacing
            modules.{" "}
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

        {/* Filter + Create Group */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Filter by Group:
            </label>
            <select
              value={filterGroupId}
              onChange={(e) => setFilterGroupId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Groups ({distinctGroupIds.length})</option>
              {distinctGroupIds.map((id) => (
                <option key={id} value={id}>
                  {getGroupLabel(id)}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-500">
              Showing {recordsWithAssignments.length} records with assignments
            </span>
            <div className="ml-auto">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center gap-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                Add Group
              </button>
            </div>
          </div>

          {/* Create Group Form */}
          {showCreateForm && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold mb-3">Add New Group</h3>
              <div className="grid grid-cols-2 gap-3 max-w-2xl">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Podsie Group ID *
                  </label>
                  <input
                    type="number"
                    value={newGroupId}
                    onChange={(e) => setNewGroupId(e.target.value)}
                    placeholder="e.g. 350"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Ms. Smith Period 3"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Grade Level *
                  </label>
                  <select
                    value={newGradeLevel}
                    onChange={(e) => setNewGradeLevel(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select grade...</option>
                    {SCOPE_SEQUENCE_TAG_OPTIONS.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    School *
                  </label>
                  <select
                    value={newSchool}
                    onChange={(e) => setNewSchool(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select school...</option>
                    {Schools.map((school) => (
                      <option key={school} value={school}>
                        {school}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleCreateGroup}
                  disabled={creatingGroup}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                >
                  {creatingGroup ? "Creating..." : "Create Group"}
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Groups Management */}
        {groups.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
            <button
              onClick={() => setShowGroups(!showGroups)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-semibold">
                Groups ({groups.length})
              </span>
              <span className="text-xs text-gray-500">
                {showGroups ? "Hide" : "Show"}
              </span>
            </button>
            {showGroups && (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-24">
                      ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-40">
                      Grade
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-48">
                      School
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {groups.map((group) => (
                    <tr key={group._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-mono text-gray-600">
                        {group.podsieGroupId}
                      </td>
                      {editingGroupId === group._id ? (
                        <>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={editGroupValues.groupName}
                              onChange={(e) =>
                                setEditGroupValues((prev) => ({
                                  ...prev,
                                  groupName: e.target.value,
                                }))
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <select
                              value={editGroupValues.gradeLevel}
                              onChange={(e) =>
                                setEditGroupValues((prev) => ({
                                  ...prev,
                                  gradeLevel: e.target.value,
                                }))
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">—</option>
                              {SCOPE_SEQUENCE_TAG_OPTIONS.map((grade) => (
                                <option key={grade} value={grade}>
                                  {grade}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <select
                              value={editGroupValues.school}
                              onChange={(e) =>
                                setEditGroupValues((prev) => ({
                                  ...prev,
                                  school: e.target.value,
                                }))
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">—</option>
                              {Schools.map((school) => (
                                <option key={school} value={school}>
                                  {school}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleSaveGroup(group)}
                                disabled={savingGroupId === group._id}
                                className="p-1 text-green-600 hover:text-green-800 cursor-pointer"
                                title="Save"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setEditingGroupId(null)}
                                className="p-1 text-gray-500 hover:text-gray-700 cursor-pointer"
                                title="Cancel"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2 text-sm">
                            {group.groupName || (
                              <span className="text-gray-400 italic">
                                No name
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {group.gradeLevel || "—"}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {group.school || "—"}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {deletingGroupId === group._id ? (
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-xs text-red-600 mr-1">
                                  Delete?
                                </span>
                                <button
                                  onClick={() => handleDeleteGroup(group._id)}
                                  className="p-1 text-red-600 hover:text-red-800 cursor-pointer"
                                  title="Confirm delete"
                                >
                                  <CheckIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setDeletingGroupId(null)}
                                  className="p-1 text-gray-500 hover:text-gray-700 cursor-pointer"
                                  title="Cancel"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleStartEditGroup(group)}
                                  className="p-1 text-blue-600 hover:text-blue-800 cursor-pointer"
                                  title="Edit"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setDeletingGroupId(group._id)}
                                  className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                                  title="Delete"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

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
                      {getGroupLabel(record.podsieGroupId)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {record.moduleName
                        ? `${record.moduleName} (${record.podsieModuleId})`
                        : `Module ${record.podsieModuleId}`}
                    </span>
                    <div className="flex items-center gap-1">
                      <label className="text-xs text-gray-500">Unit #:</label>
                      <input
                        type="number"
                        value={getUnitNumberValue(record)}
                        placeholder="—"
                        onChange={(e) =>
                          handleUnitNumberChange(record._id, e.target.value)
                        }
                        className="w-16 px-2 py-0.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
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
                    disabled={savingId === record._id || !hasEdits(record._id)}
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
