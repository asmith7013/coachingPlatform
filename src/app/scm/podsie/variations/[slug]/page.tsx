"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getVariationBySlug } from "@/app/actions/scm/podsie/assignment-variations";
import type {
  AssignmentVariation,
  QuestionVariation,
} from "@/lib/schema/zod-schema/scm/podsie/assignment-variation";
import { Spinner } from "@/components/core/feedback/Spinner";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function VariationDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const [variation, setVariation] = useState<AssignmentVariation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
    new Set(),
  );
  const router = useRouter();

  useEffect(() => {
    async function loadVariation() {
      try {
        const result = await getVariationBySlug(slug);

        if (result.success && result.data) {
          setVariation(result.data as AssignmentVariation);
        } else {
          setError(result.error || "Failed to load variation");
        }
      } catch {
        setError("An error occurred while loading the variation");
      } finally {
        setLoading(false);
      }
    }

    loadVariation();
  }, [slug]);

  const toggleQuestion = (questionNumber: number) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionNumber)) {
        newSet.delete(questionNumber);
      } else {
        newSet.add(questionNumber);
      }
      return newSet;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" variant="primary" />
      </div>
    );
  }

  if (error || !variation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-600">
          {error || "Variation not found"}
        </p>
        <button
          onClick={() => router.push("/scm/podsie/variations")}
          className="mt-4 mx-auto block px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
        >
          ← Back to Variations
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-before: always;
          }
          body {
            font-size: 12pt;
            line-height: 1.4;
          }
          .question-card {
            border: 1px solid #000 !important;
            page-break-inside: avoid;
            margin-bottom: 1rem;
          }
        }
      `}</style>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header - no print */}
        <div className="mb-8 no-print">
          <button
            onClick={() => router.push("/scm/podsie/variations")}
            className="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center cursor-pointer"
          >
            ← Back to Variations
          </button>

          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded">
                  {variation.scopeSequenceTag}
                </span>
                <span className="inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded">
                  Unit {variation.unitNumber} • Lesson {variation.lessonNumber}
                </span>
                {variation.section && (
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded">
                    Section {variation.section}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {variation.title}
              </h1>
              {variation.originalAssignmentName && (
                <p className="text-gray-600">
                  Based on: {variation.originalAssignmentName}
                </p>
              )}
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors cursor-pointer flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print
            </button>
          </div>
        </div>

        {/* Print header */}
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold">{variation.title}</h1>
          <p className="text-sm">
            {variation.scopeSequenceTag} • Unit {variation.unitNumber} • Lesson{" "}
            {variation.lessonNumber}
            {variation.section && ` • Section ${variation.section}`}
          </p>
          <div className="flex justify-between mt-2 text-sm border-b pb-2">
            <span>Name: _______________________</span>
            <span>Date: _____________</span>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {variation.questions.map((question: QuestionVariation) => (
            <div
              key={question.questionNumber}
              className="question-card bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Question header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Question {question.questionNumber}: {question.questionTitle}
                </h2>
              </div>

              {/* Question content */}
              <div className="px-6 py-4">
                {/* Context/Scenario */}
                {question.contextScenario && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-gray-700">{question.contextScenario}</p>
                  </div>
                )}

                {/* Visual (table, graph, diagram) */}
                {question.visualType !== "none" && question.visualHtml && (
                  <div className="mb-4 flex justify-center">
                    <div
                      className="visual-container"
                      dangerouslySetInnerHTML={{ __html: question.visualHtml }}
                    />
                  </div>
                )}

                {/* Question text */}
                <div className="mb-4">
                  <p className="text-gray-900 font-medium text-lg">
                    {question.questionText}
                  </p>
                </div>

                {/* Answer section - toggleable on screen, visible in print */}
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <button
                    onClick={() => toggleQuestion(question.questionNumber)}
                    className="no-print w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-medium text-green-800">
                      {expandedQuestions.has(question.questionNumber)
                        ? "Hide"
                        : "Show"}{" "}
                      Answer & Solution
                    </span>
                    <svg
                      className={`w-5 h-5 text-green-600 transition-transform ${expandedQuestions.has(question.questionNumber) ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Answer content - visible when expanded or in print */}
                  <div
                    className={`mt-4 space-y-4 ${expandedQuestions.has(question.questionNumber) ? "block" : "hidden print:block"}`}
                  >
                    {/* Correct answer */}
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-1">
                        Correct Answer:
                      </h4>
                      <p className="text-green-900 text-lg font-medium">
                        {question.correctAnswer}
                      </p>
                      {question.acceptableAnswerForms &&
                        question.acceptableAnswerForms.length > 0 && (
                          <p className="text-sm text-green-700 mt-1">
                            Also accepted:{" "}
                            {question.acceptableAnswerForms.join(", ")}
                          </p>
                        )}
                    </div>

                    {/* Solution steps */}
                    {question.solutionSteps &&
                      question.solutionSteps.length > 0 && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <h4 className="font-semibold text-gray-800 mb-2">
                            Solution Steps:
                          </h4>
                          <ol className="list-decimal list-inside space-y-1">
                            {question.solutionSteps.map((step, idx) => (
                              <li key={idx} className="text-gray-700">
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                    {/* Explanation */}
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-semibold text-yellow-800 mb-1">
                        Teaching Notes:
                      </h4>
                      <p className="text-gray-700">{question.explanation}</p>
                    </div>

                    {/* Acceptance criteria */}
                    {question.acceptanceCriteria &&
                      question.acceptanceCriteria.length > 0 && (
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 no-print">
                          <h4 className="font-semibold text-purple-800 mb-2">
                            Acceptance Criteria:
                          </h4>
                          <ul className="list-disc list-inside space-y-1">
                            {question.acceptanceCriteria.map(
                              (criteria, idx) => (
                                <li key={idx} className="text-gray-700 text-sm">
                                  {criteria}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notes section */}
        {variation.notes && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 no-print">
            <h3 className="font-semibold text-gray-800 mb-2">Notes:</h3>
            <p className="text-gray-600">{variation.notes}</p>
          </div>
        )}
      </div>
    </>
  );
}
