"use client";

import { useState, useEffect } from "react";
import { fetchSectionConfigs, updateSectionConfig } from "@/app/actions/313/section-config";
import { toast } from "sonner";

interface SectionConfigWithGroupId {
  _id: string;
  school: string;
  classSection: string;
  teacher?: string;
  gradeLevel: string;
  groupId?: string;
  active: boolean;
}

export default function GroupIdsPage() {
  const [configs, setConfigs] = useState<SectionConfigWithGroupId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedGroupIds, setEditedGroupIds] = useState<Record<string, string>>({});

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setIsLoading(true);
    try {
      const response = await fetchSectionConfigs();
      if (response.success && response.data) {
        setConfigs(response.data as SectionConfigWithGroupId[]);
      } else {
        toast.error("Failed to load section configs");
      }
    } catch (error) {
      toast.error("Error loading section configs");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupIdChange = (configId: string, groupId: string) => {
    setEditedGroupIds(prev => ({
      ...prev,
      [configId]: groupId
    }));
  };

  const handleSave = async (config: SectionConfigWithGroupId) => {
    const newGroupId = editedGroupIds[config._id];
    if (newGroupId === undefined) {
      toast.error("No changes to save");
      return;
    }

    setIsSaving(true);
    try {
      const response = await updateSectionConfig(config._id, {
        groupId: newGroupId.trim() || undefined
      });

      if (response.success) {
        toast.success(`Updated ${config.classSection}`);
        // Remove from edited state
        setEditedGroupIds(prev => {
          const next = { ...prev };
          delete next[config._id];
          return next;
        });
        // Reload to get fresh data
        await loadConfigs();
      } else {
        toast.error(response.error || "Failed to update");
      }
    } catch (error) {
      toast.error("Error updating config");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    if (Object.keys(editedGroupIds).length === 0) {
      toast.error("No changes to save");
      return;
    }

    setIsSaving(true);
    let successCount = 0;
    let errorCount = 0;

    for (const config of configs) {
      const newGroupId = editedGroupIds[config._id];
      if (newGroupId !== undefined) {
        try {
          const response = await updateSectionConfig(config._id, {
            groupId: newGroupId.trim() || undefined
          });

          if (response.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
          console.error(error);
        }
      }
    }

    if (successCount > 0) {
      toast.success(`Updated ${successCount} section config${successCount > 1 ? 's' : ''}`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to update ${errorCount} config${errorCount > 1 ? 's' : ''}`);
    }

    setEditedGroupIds({});
    await loadConfigs();
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Podsie Group IDs</h1>
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Podsie Group IDs</h1>
        <p className="text-gray-600">
          Set the Podsie group ID for each section config. The group ID is used to identify which Podsie group corresponds to each class section.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Section</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Teacher</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Grade</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Current Group ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">New Group ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {configs.map((config) => {
                const hasChanges = editedGroupIds[config._id] !== undefined;
                const displayGroupId = hasChanges
                  ? editedGroupIds[config._id]
                  : (config.groupId || '');

                return (
                  <tr key={config._id} className={hasChanges ? 'bg-yellow-50' : ''}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {config.classSection}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {config.teacher || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {config.gradeLevel}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {config.groupId || <span className="text-gray-400 italic">Not set</span>}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={displayGroupId}
                        onChange={(e) => handleGroupIdChange(config._id, e.target.value)}
                        placeholder="Enter Podsie group ID"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSaving}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleSave(config)}
                        disabled={isSaving || !hasChanges}
                        className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {Object.keys(editedGroupIds).length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {Object.keys(editedGroupIds).length} unsaved change{Object.keys(editedGroupIds).length > 1 ? 's' : ''}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEditedGroupIds({})}
                disabled={isSaving}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                Discard Changes
              </button>
              <button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-blue-800 font-medium mb-2">How to find Podsie Group IDs</h3>
        <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
          <li>Go to Podsie and navigate to the class/group</li>
          <li>Look at the URL - the group ID is in the URL path</li>
          <li>Example: <code className="bg-blue-100 px-1 rounded">podsie.com/groups/352</code> → Group ID is <strong>352</strong></li>
          <li>Enter the group ID in the table above for the corresponding section</li>
        </ol>
      </div>
    </div>
  );
}
