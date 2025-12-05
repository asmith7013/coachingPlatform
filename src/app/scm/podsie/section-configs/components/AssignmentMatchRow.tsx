import { useState } from "react";
import { CheckIcon, ArrowPathIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import type { PodsieAssignmentInfo } from "@/app/actions/313/podsie-sync";
import type { ScopeAndSequence } from "@zod-schema/313/curriculum/scope-and-sequence";
import { SectionRadioGroup } from "@/components/core/inputs/SectionRadioGroup";
import { getQuestionMap } from "@/app/actions/313/podsie-question-map";
import type { PodsieQuestionMap } from "@zod-schema/313/podsie/section-config";

interface AssignmentMatchRowProps {
  index: number;
  podsieAssignment: PodsieAssignmentInfo;
  matchedLesson: ScopeAndSequence | null;
  assignmentType: 'sidekick' | 'mastery-check' | 'assessment';
  totalQuestions?: number;
  lessonsByUnit: Record<string, ScopeAndSequence[]>;
  alreadyExists: boolean;
  hasQuestionMapping: boolean;
  saving: boolean;
  onMatchChange: (lessonId: string) => void;
  onTypeChange: (type: 'sidekick' | 'mastery-check' | 'assessment') => void;
  onTotalQuestionsChange: (total: number | undefined) => void;
  onSave: () => void;
  onQuestionMapImport?: (questionMap: PodsieQuestionMap[]) => void;
}

export function AssignmentMatchRow({
  index,
  podsieAssignment,
  matchedLesson,
  assignmentType,
  totalQuestions,
  lessonsByUnit,
  alreadyExists,
  hasQuestionMapping,
  saving,
  onMatchChange,
  onTypeChange,
  onTotalQuestionsChange,
  onSave,
  onQuestionMapImport
}: AssignmentMatchRowProps) {
  const [importing, setImporting] = useState(false);

  const handleImportQuestionMap = async () => {
    if (!onQuestionMapImport) return;

    setImporting(true);
    try {
      const result = await getQuestionMap(podsieAssignment.assignmentId.toString());

      if (result.success && result.data) {
        onQuestionMapImport(result.data.questionMap);
        alert(`Imported ${result.data.questionMap.length} questions for ${result.data.assignmentName}`);
      } else {
        alert(`No question map found for assignment ID ${podsieAssignment.assignmentId}.\n\nPlease create one in the Question Mapper page first.`);
      }
    } catch (error) {
      console.error("Error importing question map:", error);
      alert('Failed to import question map');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${
      alreadyExists ? 'border-green-300 bg-green-50/30' : 'border-gray-200'
    }`}>
      {/* Status Badges */}
      {alreadyExists && (
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-100 border border-green-300 rounded-lg">
            <CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-xs font-medium text-green-800">
              Saved in section config
            </span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 border rounded-lg ${
            hasQuestionMapping
              ? 'bg-blue-100 border-blue-300'
              : 'bg-gray-100 border-gray-300'
          }`}>
            <span className={`text-xs font-medium ${
              hasQuestionMapping ? 'text-blue-800' : 'text-gray-600'
            }`}>
              {hasQuestionMapping
                ? `✓ Question mapping`
                : '✗ No question mapping'}
            </span>
          </div>
        </div>
      )}

      {/* Podsie Assignment Info */}
      <div className="bg-blue-50 p-3 rounded mb-4">
        <div className="text-sm font-medium text-blue-900 mb-1">
          Podsie Assignment #{index + 1}
        </div>
        <div className="font-semibold text-gray-900 mb-1">
          {podsieAssignment.assignmentName}
        </div>
        <div className="text-sm text-gray-600">
          ID: {podsieAssignment.assignmentId} • {podsieAssignment.totalQuestions} questions
        </div>
      </div>

      {/* Assignment Type and Total Questions */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <SectionRadioGroup
            label="Assignment Type"
            options={[
              { id: 'assessment', name: 'Assessment' },
              { id: 'mastery-check', name: 'Mastery Check' },
              { id: 'sidekick', name: 'Sidekick' }
            ]}
            value={assignmentType}
            onChange={(value) => onTypeChange(value as 'sidekick' | 'mastery-check' | 'assessment')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Questions
          </label>
          <input
            type="number"
            min="1"
            value={totalQuestions ?? podsieAssignment.totalQuestions}
            onChange={(e) => {
              const value = parseInt(e.target.value) || undefined;
              onTotalQuestionsChange(value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Match with Existing Lesson */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Lesson from Scope & Sequence
        </label>
        <select
          value={matchedLesson?.id || ''}
          onChange={(e) => onMatchChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            matchedLesson
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300'
          }`}
        >
          <option value="">Select a lesson...</option>
          {Object.entries(lessonsByUnit).map(([unit, unitLessons]) => (
            <optgroup key={unit} label={unit}>
              {unitLessons.map(lesson => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.unitLessonId}: {lesson.lessonName}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {matchedLesson && (
          <div className="mt-2 text-sm text-green-700 flex items-center gap-1">
            <CheckIcon className="w-4 h-4" />
            Matched: {matchedLesson.unitLessonId} - {matchedLesson.lessonName}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {matchedLesson && (
        <div className="pt-4 border-t border-gray-200 space-y-2">
          {/* Import Question Map Button */}
          {onQuestionMapImport && (
            <button
              onClick={handleImportQuestionMap}
              disabled={importing}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {importing ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Import Question Map
                </>
              )}
            </button>
          )}

          {/* Save Button */}
          <button
            onClick={onSave}
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {saving ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="w-5 h-5" />
                {alreadyExists ? 'Update Assignment' : 'Save Assignment'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
