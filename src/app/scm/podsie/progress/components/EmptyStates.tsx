import { Spinner } from "@/components/core/feedback/Spinner";
import { BookOpenIcon, ChartBarIcon } from "@heroicons/react/24/outline";

interface LoadingStateProps {
  message?: string;
  submessage?: string;
}

export function LoadingState({
  message = "Loading...",
  submessage,
}: LoadingStateProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <Spinner size="lg" variant="primary" />
            </div>
            <div className="text-gray-600">{message}</div>
            {submessage && (
              <div className="text-gray-500 text-sm mt-1">{submessage}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProgressLoadingStateProps {
  loadingLessons: boolean;
}

export function ProgressLoadingState({
  loadingLessons,
}: ProgressLoadingStateProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
      <div className="flex flex-col items-center justify-center">
        <div className="mb-4">
          <Spinner size="lg" variant="primary" />
        </div>
        <div className="text-gray-600 font-medium mb-1">
          {loadingLessons ? "Loading lessons..." : "Loading progress data..."}
        </div>
        <div className="text-gray-500 text-sm">
          Please wait while we fetch the assignment data
        </div>
      </div>
    </div>
  );
}

interface NoAssignmentsStateProps {
  selectedUnit: number;
  selectedLessonSection: string;
}

export function NoAssignmentsState({
  selectedUnit,
  selectedLessonSection,
}: NoAssignmentsStateProps) {
  const sectionDisplay =
    selectedLessonSection === "all"
      ? "All Lessons"
      : selectedLessonSection.length === 1
        ? `Section ${selectedLessonSection}`
        : selectedLessonSection;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
      <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <div className="text-gray-600">
        No assignments found for Unit {selectedUnit}, {sectionDisplay}
      </div>
      <div className="text-gray-500 text-sm mt-2">
        Add Podsie assignments in the Section Config page for this class section
      </div>
    </div>
  );
}

export function SelectFiltersState() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
      <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <div className="text-gray-600">
        Select a class section, unit, and lesson section to view assignment
        progress
      </div>
    </div>
  );
}
