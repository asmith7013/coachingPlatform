"use client";

import { useState } from "react";
import { CheckCircleIcon, ExclamationTriangleIcon, DocumentArrowUpIcon } from "@heroicons/react/24/solid";
import { useToast } from "@/components/core/feedback/Toast";
import { generateQuestionMapFromResponses, saveQuestionMap, getQuestionMap } from "@/app/actions/313/podsie-question-map";
import type { PodsieQuestionMap } from "@zod-schema/313/section-config";
import { Spinner } from "@/components/core/feedback/Spinner";

type ImportMode = 'api' | 'json';

interface CurriculumQuestion {
  questionNumber: number;
  external_id: string;
  isRoot: boolean;
  hasVariations: boolean;
  variations: Array<{ order: number; external_id: string }>;
}

interface CurriculumData {
  assignment: {
    external_id: string;
    title: string;
    path?: string;
  };
  questions: CurriculumQuestion[];
  summary: {
    totalRootQuestions: number;
    totalVariations: number;
    totalQuestions: number;
    variationsPerQuestion: number;
    q1HasVariations: boolean;
  };
}

export default function QuestionMapperPage() {
  const [importMode, setImportMode] = useState<ImportMode>('api');
  const [assignmentId, setAssignmentId] = useState("");
  const [email, setEmail] = useState("alex.smith@teachinglab.org");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [assignmentName, setAssignmentName] = useState("");
  const [questionMap, setQuestionMap] = useState<PodsieQuestionMap[]>([]);
  const [existingMapping, setExistingMapping] = useState<{ assignmentId: string; assignmentName: string } | null>(null);

  // JSON import state
  const [jsonInput, setJsonInput] = useState("");
  const [jsonAssignmentId, setJsonAssignmentId] = useState("");

  const { showToast, ToastComponent } = useToast();

  // Reset state when assignment ID changes
  const handleAssignmentIdChange = (newId: string) => {
    setAssignmentId(newId);
    setAssignmentName("");
    setQuestionMap([]);
    setExistingMapping(null);
  };

  // Transform curriculum format to internal question map format
  const transformCurriculumToQuestionMap = (curriculumData: CurriculumData): PodsieQuestionMap[] => {
    const questionMapArray: PodsieQuestionMap[] = [];

    for (const question of curriculumData.questions) {
      // Add root question
      questionMapArray.push({
        questionNumber: question.questionNumber,
        questionId: question.external_id,
        isRoot: true,
      });

      // Add variations if they exist
      if (question.hasVariations && question.variations.length > 0) {
        for (const variation of question.variations) {
          questionMapArray.push({
            questionNumber: question.questionNumber,
            questionId: variation.external_id,
            isRoot: false,
            rootQuestionId: question.external_id,
            variantNumber: variation.order,
          });
        }
      }
    }

    return questionMapArray;
  };

  // Handle JSON import
  const handleJsonImport = async () => {
    if (!jsonInput.trim()) {
      showToast({
        title: 'Validation Error',
        description: 'Please paste JSON data',
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
      return;
    }

    if (!jsonAssignmentId.trim()) {
      showToast({
        title: 'Validation Error',
        description: 'Please enter an assignment ID',
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
      return;
    }

    setLoading(true);
    setQuestionMap([]);
    setAssignmentName("");
    setExistingMapping(null);

    try {
      // Parse JSON
      const curriculumData: CurriculumData = JSON.parse(jsonInput);

      // Validate structure
      if (!curriculumData.assignment || !curriculumData.questions || !curriculumData.summary) {
        throw new Error('Invalid JSON structure. Expected assignment, questions, and summary fields.');
      }

      // Check for existing mapping
      const existingResult = await getQuestionMap(jsonAssignmentId.trim());

      if (existingResult.success && existingResult.data) {
        setExistingMapping({
          assignmentId: existingResult.data.assignmentId,
          assignmentName: existingResult.data.assignmentName,
        });
        showToast({
          title: 'Existing Mapping Found',
          description: `Found existing mapping for: ${existingResult.data.assignmentName}`,
          variant: 'warning',
          icon: ExclamationTriangleIcon,
        });
      }

      // Transform curriculum data to question map
      const transformedQuestionMap = transformCurriculumToQuestionMap(curriculumData);

      setAssignmentName(curriculumData.assignment.title);
      setQuestionMap(transformedQuestionMap);
      setAssignmentId(jsonAssignmentId.trim());

      showToast({
        title: 'JSON Imported',
        description: `Loaded ${curriculumData.summary.totalRootQuestions} root questions with ${curriculumData.summary.totalVariations} variations`,
        variant: 'success',
        icon: CheckCircleIcon,
      });

    } catch (error) {
      console.error("Error parsing JSON:", error);
      showToast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Invalid JSON format',
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAndFetch = async () => {
    if (!assignmentId.trim()) {
      showToast({
        title: 'Validation Error',
        description: 'Please enter an assignment ID',
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
      return;
    }

    setLoading(true);
    setQuestionMap([]);
    setAssignmentName("");
    setExistingMapping(null);

    try {
      // First, check for existing mapping
      const existingResult = await getQuestionMap(assignmentId.trim());

      if (existingResult.success && existingResult.data) {
        setExistingMapping({
          assignmentId: existingResult.data.assignmentId,
          assignmentName: existingResult.data.assignmentName,
        });
        showToast({
          title: 'Existing Mapping Found',
          description: `Found existing mapping for: ${existingResult.data.assignmentName}`,
          variant: 'warning',
          icon: ExclamationTriangleIcon,
        });
      }

      // Then, fetch fresh data from Podsie API
      const result = await generateQuestionMapFromResponses(assignmentId.trim(), email);

      if (result.success && result.data) {
        setAssignmentName(result.data.assignmentName);
        setQuestionMap(result.data.questionMap);
        showToast({
          title: 'Data Loaded',
          description: `Found ${result.data.totalQuestions} questions for ${result.data.assignmentName}`,
          variant: 'success',
          icon: CheckCircleIcon,
        });
      } else {
        showToast({
          title: 'Fetch Failed',
          description: result.error || 'Failed to fetch responses',
          variant: 'error',
          icon: ExclamationTriangleIcon,
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
      showToast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!assignmentId.trim() || !assignmentName || questionMap.length === 0) {
      showToast({
        title: 'Validation Error',
        description: 'Please generate a question map first',
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
      return;
    }

    // Confirm if overwriting existing
    if (existingMapping) {
      const confirmed = window.confirm(
        `This will overwrite the existing mapping for "${existingMapping.assignmentName}". Continue?`
      );
      if (!confirmed) return;
    }

    setSaving(true);
    try {
      const result = await saveQuestionMap({
        assignmentId: assignmentId.trim(),
        assignmentName,
        questionMap,
        totalQuestions: questionMap.length,
        createdBy: email,
      });

      if (result.success) {
        showToast({
          title: existingMapping ? 'Mapping Updated' : 'Mapping Saved',
          description: `Successfully ${existingMapping ? 'updated' : 'saved'} question map for ${assignmentName}`,
          variant: 'success',
          icon: CheckCircleIcon,
        });
        setExistingMapping({
          assignmentId: assignmentId.trim(),
          assignmentName,
        });
      } else {
        showToast({
          title: 'Save Failed',
          description: result.error || 'Failed to save question map',
          variant: 'error',
          icon: ExclamationTriangleIcon,
        });
      }
    } catch (error) {
      console.error("Error saving question map:", error);
      showToast({
        title: 'Error',
        description: 'An unexpected error occurred while saving',
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6" style={{ maxWidth: "1400px" }}>
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">Podsie Question Mapper</h1>
          <p className="text-gray-600">
            Generate question mappings from Podsie assignment responses or import from curriculum JSON
          </p>
        </div>

        {/* Import Mode Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setImportMode('api')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  importMode === 'api'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                From Podsie API
              </button>
              <button
                onClick={() => setImportMode('json')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  importMode === 'json'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <DocumentArrowUpIcon className="w-4 h-4 inline mr-2" />
                From Curriculum JSON
              </button>
            </nav>
          </div>
        </div>

        {/* Input Form - API Mode */}
        {importMode === 'api' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Podsie Assignment ID
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={assignmentId}
                    onChange={(e) => handleAssignmentIdChange(e.target.value)}
                    placeholder="e.g., 19351"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleCheckAndFetch()}
                  />
                  <button
                    onClick={handleCheckAndFetch}
                    disabled={loading || !assignmentId.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Loading...' : 'Load Assignment'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@teachinglab.org"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email of student who completed the assignment without variants
                </p>
              </div>

              {existingMapping && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> Existing mapping found for &quot;{existingMapping.assignmentName}&quot;.
                    Saving will overwrite it.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input Form - JSON Mode */}
        {importMode === 'json' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Podsie Assignment ID
                </label>
                <input
                  type="text"
                  value={jsonAssignmentId}
                  onChange={(e) => setJsonAssignmentId(e.target.value)}
                  placeholder="e.g., 19404"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the Podsie assignment ID for this mapping
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Curriculum JSON Data
                </label>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={`Paste JSON from podsie-curriculum here...\n\n{\n  "assignment": {\n    "external_id": "...",\n    "title": "...",\n    ...\n  },\n  "questions": [...],\n  "summary": {...}\n}`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  rows={12}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste the JSON export from podsie-curriculum containing assignment info, questions, and variations
                </p>
              </div>

              <button
                onClick={handleJsonImport}
                disabled={loading || !jsonInput.trim() || !jsonAssignmentId.trim()}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <DocumentArrowUpIcon className="w-5 h-5" />
                    <span>Import JSON</span>
                  </>
                )}
              </button>

              {existingMapping && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> Existing mapping found for &quot;{existingMapping.assignmentName}&quot;.
                    Saving will overwrite it.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="flex justify-center items-center">
              <Spinner size="lg" variant="primary" />
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && questionMap.length > 0 && (
          <div className="space-y-6">
            {/* Assignment Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">{assignmentName}</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Assignment ID:</span>
                  <span className="ml-2 font-mono">{assignmentId}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Questions:</span>
                  <span className="ml-2 font-semibold">{questionMap.length}</span>
                </div>
              </div>
            </div>

            {/* Question Map Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Question Mapping</h3>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Spinner size="sm" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>Save Question Map</span>
                    </>
                  )}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Question #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Question ID
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Root Question
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Variant #
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {questionMap.map((question, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {question.questionNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {question.questionId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {question.isRoot ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Root
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Variant
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-mono text-gray-600">
                          {question.rootQuestionId || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                          {question.variantNumber || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">Summary:</p>
                <ul className="space-y-1">
                  <li>Total questions mapped: {questionMap.length}</li>
                  <li>Root questions: {questionMap.filter(q => q.isRoot).length}</li>
                  <li>Variant questions: {questionMap.filter(q => !q.isRoot).length}</li>
                </ul>
                {importMode === 'api' && (
                  <p className="mt-3">
                    <strong>Note:</strong> All questions are marked as root questions. This assumes the student
                    completed the assignment without encountering any variant questions.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && questionMap.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600">
              {importMode === 'api'
                ? 'Enter an assignment ID and click "Load Assignment" to get started'
                : 'Enter an assignment ID and paste curriculum JSON data to import'
              }
            </p>
          </div>
        )}

        <ToastComponent />
      </div>
    </div>
  );
}
