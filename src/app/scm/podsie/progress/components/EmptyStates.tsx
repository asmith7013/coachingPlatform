interface LoadingStateProps {
  message?: string;
  submessage?: string;
}

export function LoadingState({ message = "Loading...", submessage }: LoadingStateProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600">{message}</div>
            {submessage && <div className="text-gray-500 text-sm mt-1">{submessage}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProgressLoadingStateProps {
  loadingLessons: boolean;
}

export function ProgressLoadingState({ loadingLessons }: ProgressLoadingStateProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
      <div className="flex flex-col items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div className="text-gray-600 font-medium mb-1">
          {loadingLessons ? 'Loading lessons...' : 'Loading progress data...'}
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

export function NoAssignmentsState({ selectedUnit, selectedLessonSection }: NoAssignmentsStateProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
      <div className="text-gray-400 text-4xl mb-4">📚</div>
      <div className="text-gray-600">
        No assignments found for Unit {selectedUnit}, Section {selectedLessonSection}
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
      <div className="text-gray-400 text-4xl mb-4">📊</div>
      <div className="text-gray-600">
        Select a class section, unit, and lesson section to view assignment progress
      </div>
    </div>
  );
}
