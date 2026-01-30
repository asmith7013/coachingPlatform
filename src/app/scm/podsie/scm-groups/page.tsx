"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  fetchPodsieScmGroups,
  createPodsieScmGroup,
  updatePodsieScmGroup,
  deletePodsieScmGroup,
} from "@actions/scm/podsie/podsie-scm-group";

interface ScmGroupRecord {
  _id: string;
  podsieGroupId: number;
  podsieModuleId: number;
  moduleStartDate?: string | null;
  pointsRewardGoal?: number | null;
  pointsRewardDescription?: string | null;
  assignments?: unknown[];
}

interface NewRecordForm {
  podsieGroupId: string;
  podsieModuleId: string;
  moduleStartDate: string;
  pointsRewardGoal: string;
  pointsRewardDescription: string;
}

const emptyForm: NewRecordForm = {
  podsieGroupId: "",
  podsieModuleId: "",
  moduleStartDate: "",
  pointsRewardGoal: "",
  pointsRewardDescription: "",
};

export default function ScmGroupsPage() {
  const [records, setRecords] = useState<ScmGroupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter
  const [filterGroupId, setFilterGroupId] = useState("");

  // Create form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRecord, setNewRecord] = useState<NewRecordForm>(emptyForm);
  const [creating, setCreating] = useState(false);

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<NewRecordForm>>({});

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        (r) => r.podsieGroupId === parseInt(filterGroupId, 10)
      )
    : records;

  // Distinct group IDs for filter dropdown
  const distinctGroupIds = [
    ...new Set(records.map((r) => r.podsieGroupId)),
  ].sort((a, b) => a - b);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess(null);

    const groupId = parseInt(newRecord.podsieGroupId, 10);
    const moduleId = parseInt(newRecord.podsieModuleId, 10);

    if (isNaN(groupId) || isNaN(moduleId)) {
      setError("Group ID and Module ID must be valid numbers");
      setCreating(false);
      return;
    }

    try {
      const result = await createPodsieScmGroup({
        podsieGroupId: groupId,
        podsieModuleId: moduleId,
        moduleStartDate: newRecord.moduleStartDate || undefined,
        pointsRewardGoal: newRecord.pointsRewardGoal
          ? parseInt(newRecord.pointsRewardGoal, 10)
          : undefined,
        pointsRewardDescription:
          newRecord.pointsRewardDescription || undefined,
        assignments: [],
      });

      if (result.success) {
        setSuccess("Record created successfully");
        setNewRecord(emptyForm);
        setShowCreateForm(false);
        await loadRecords();
      } else {
        setError(result.error || "Failed to create record");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create record");
    } finally {
      setCreating(false);
    }
  };

  const handleStartEdit = (record: ScmGroupRecord) => {
    setEditingId(record._id);
    setEditValues({
      moduleStartDate: record.moduleStartDate || "",
      pointsRewardGoal: record.pointsRewardGoal?.toString() || "",
      pointsRewardDescription: record.pointsRewardDescription || "",
    });
  };

  const handleSaveEdit = async (record: ScmGroupRecord) => {
    setError(null);
    setSuccess(null);

    try {
      const result = await updatePodsieScmGroup(record._id, {
        moduleStartDate: editValues.moduleStartDate || null,
        pointsRewardGoal: editValues.pointsRewardGoal
          ? parseInt(editValues.pointsRewardGoal, 10)
          : null,
        pointsRewardDescription:
          editValues.pointsRewardDescription || null,
      });

      if (result.success) {
        setSuccess("Record updated successfully");
        setEditingId(null);
        await loadRecords();
      } else {
        setError(result.error || "Failed to update record");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update record");
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    setSuccess(null);

    try {
      const result = await deletePodsieScmGroup(id);
      if (result.success) {
        setSuccess("Record deleted successfully");
        setDeletingId(null);
        await loadRecords();
      } else {
        setError(result.error || "Failed to delete record");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete record");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Podsie SCM Groups</h1>
              <p className="text-gray-600 mt-1">
                Manage pacing configurations for Podsie groups used in SCM.
                {" "}
                <span className="text-gray-500">
                  {records.length} records, {distinctGroupIds.length} groups
                </span>
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Add Record
            </button>
          </div>
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

        {/* Create Form */}
        {showCreateForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-lg shadow-sm p-6 mb-6"
          >
            <h2 className="text-lg font-semibold mb-4">Add New Record</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Podsie Group ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newRecord.podsieGroupId}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, podsieGroupId: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Podsie Module ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newRecord.podsieModuleId}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, podsieModuleId: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module Start Date
                </label>
                <input
                  type="date"
                  value={newRecord.moduleStartDate}
                  onChange={(e) =>
                    setNewRecord({
                      ...newRecord,
                      moduleStartDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points Reward Goal
                </label>
                <input
                  type="number"
                  value={newRecord.pointsRewardGoal}
                  onChange={(e) =>
                    setNewRecord({
                      ...newRecord,
                      pointsRewardGoal: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points Reward Description
                </label>
                <input
                  type="text"
                  value={newRecord.pointsRewardDescription}
                  onChange={(e) =>
                    setNewRecord({
                      ...newRecord,
                      pointsRewardDescription: e.target.value,
                    })
                  }
                  placeholder='e.g., "Pizza party"'
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {creating ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewRecord(emptyForm);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
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
              Showing {filteredRecords.length} records
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No records found. Click &quot;Add Record&quot; to create one.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Group ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Module ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Start Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Assignments
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Points Goal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Reward
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">
                      {record.podsieGroupId}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">
                      {record.podsieModuleId}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {editingId === record._id ? (
                        <input
                          type="date"
                          value={editValues.moduleStartDate || ""}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              moduleStartDate: e.target.value,
                            })
                          }
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        record.moduleStartDate || "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {record.assignments?.length || 0}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {editingId === record._id ? (
                        <input
                          type="number"
                          value={editValues.pointsRewardGoal || ""}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              pointsRewardGoal: e.target.value,
                            })
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        record.pointsRewardGoal ?? "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {editingId === record._id ? (
                        <input
                          type="text"
                          value={editValues.pointsRewardDescription || ""}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              pointsRewardDescription: e.target.value,
                            })
                          }
                          className="w-40 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        record.pointsRewardDescription || "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === record._id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(record)}
                              className="p-1 text-green-600 hover:text-green-800"
                              title="Save"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 text-gray-500 hover:text-gray-700"
                              title="Cancel"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </>
                        ) : deletingId === record._id ? (
                          <>
                            <span className="text-xs text-red-600 mr-1">
                              Delete?
                            </span>
                            <button
                              onClick={() => handleDelete(record._id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Confirm delete"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="p-1 text-gray-500 hover:text-gray-700"
                              title="Cancel"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(record)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletingId(record._id)}
                              className="p-1 text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
