"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getWorkedExampleRequests,
  updateWorkedExampleRequestStatus,
} from "@actions/scm/podsie/worked-example-requests";
import {
  WorkedExampleRequest,
  WorkedExampleRequestStatus,
} from "@zod-schema/scm/podsie/worked-example-request";
import { Alert } from "@/components/core/feedback/Alert";
import { Spinner } from "@/components/core/feedback/Spinner";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

const STATUS_OPTIONS: WorkedExampleRequestStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
];

const STATUS_COLORS: Record<WorkedExampleRequestStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};

const STATUS_LABELS: Record<WorkedExampleRequestStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function WorkedExampleRequestAdminPage() {
  const [requests, setRequests] = useState<WorkedExampleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    WorkedExampleRequestStatus | ""
  >("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = statusFilter ? { status: statusFilter } : undefined;
      const result = await getWorkedExampleRequests(query);

      if (result.success && result.data) {
        setRequests(result.data);
      } else {
        setError(result.error || "Failed to load requests");
      }
    } catch (err) {
      setError("Failed to load requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // Load requests
  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleStatusChange = async (
    id: string,
    newStatus: WorkedExampleRequestStatus,
  ) => {
    setUpdating(id);
    try {
      const result = await updateWorkedExampleRequestStatus(id, newStatus);

      if (result.success) {
        // Update local state
        setRequests((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r)),
        );
      } else {
        setError(result.error || "Failed to update status");
      }
    } catch (err) {
      setError("Failed to update status");
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const filteredRequests = statusFilter
    ? requests.filter((r) => r.status === statusFilter)
    : requests;

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const inProgressCount = requests.filter(
    (r) => r.status === "in_progress",
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6" style={{ maxWidth: "1400px" }}>
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Worked Example Request Queue
              </h1>
              <p className="text-gray-600">
                Manage worked example requests from teachers
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {pendingCount}
                </div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {inProgressCount}
                </div>
                <div className="text-sm text-gray-500">In Progress</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 items-center">
            <label
              htmlFor="status-filter"
              className="text-sm font-medium text-gray-700"
            >
              Filter by Status:
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as WorkedExampleRequestStatus | "",
                )
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <button
              onClick={loadRequests}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <Alert intent="error" className="mb-6">
            <Alert.Title>Error</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center min-h-[200px]">
            <Spinner size="lg" variant="primary" />
          </div>
        )}

        {/* Request list */}
        {!loading && filteredRequests.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Requests Found
            </h3>
            <p className="text-gray-500">
              {statusFilter
                ? `No ${STATUS_LABELS[statusFilter].toLowerCase()} requests found.`
                : "No worked example requests have been submitted yet."}
            </p>
          </div>
        )}

        {!loading && filteredRequests.length > 0 && (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    {/* Left side: Lesson info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full border ${STATUS_COLORS[request.status]}`}
                        >
                          {STATUS_LABELS[request.status]}
                        </span>
                        <span className="text-sm text-gray-500">
                          {request.createdAt
                            ? formatDate(request.createdAt)
                            : "Unknown date"}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {request.lessonName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {request.scopeSequenceTag} • Unit {request.unitNumber},
                        Lesson {request.lessonNumber}
                        {request.section && ` • Section ${request.section}`}
                      </p>
                    </div>

                    {/* Right side: Actions */}
                    <div className="flex items-center gap-2">
                      {updating === request._id ? (
                        <Spinner size="sm" variant="primary" />
                      ) : (
                        <select
                          value={request.status}
                          onChange={(e) =>
                            handleStatusChange(
                              request._id,
                              e.target.value as WorkedExampleRequestStatus,
                            )
                          }
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABELS[status]}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Content grid */}
                  <div className="grid grid-cols-3 gap-6">
                    {/* Column 1: Math details */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Math Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Concept:</span>{" "}
                          <span className="font-medium">
                            {request.mathConcept}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Standard:</span>{" "}
                          <span className="font-medium">
                            {request.mathStandard}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">
                            Struggling Skills:
                          </span>{" "}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {request.strugglingSkillNumbers.map((num) => (
                              <span
                                key={num}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-800 font-bold text-xs"
                              >
                                {num}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Misconception description */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Misconception
                      </h4>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {request.strugglingDescription}
                      </p>
                      {request.additionalNotes && (
                        <div className="mt-3">
                          <h4 className="text-sm font-semibold text-gray-700 mb-1">
                            Additional Notes
                          </h4>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">
                            {request.additionalNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Column 3: Source image */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Source Image
                      </h4>
                      <div
                        onClick={() => setSelectedImage(request.sourceImageUrl)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={request.sourceImageUrl}
                          alt={request.sourceImageFilename}
                          className="max-h-32 rounded-lg border border-gray-200"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {request.sourceImageFilename}
                      </p>
                      <a
                        href={request.sourceImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Open in new tab
                      </a>
                    </div>
                  </div>

                  {/* Footer: Requested by */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Requested by: {request.requestedByEmail || "Unknown"}
                    </div>
                    {request.completedWorkedExampleId && (
                      <a
                        href={`/scm/workedExamples/${request.completedWorkedExampleId}`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Completed Worked Example →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setSelectedImage(null)}
          >
            <div className="max-w-4xl max-h-[90vh] p-4">
              <img
                src={selectedImage}
                alt="Full size"
                className="max-w-full max-h-[85vh] rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
