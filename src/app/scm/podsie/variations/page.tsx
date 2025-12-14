"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listAssignmentVariations } from '@/app/actions/scm/assignment-variations';
import type { AssignmentVariation } from '@/lib/schema/zod-schema/scm/podsie/assignment-variation';
import { Spinner } from '@/components/core/feedback/Spinner';

type VariationWithCount = AssignmentVariation & { questionCount: number };

export default function AssignmentVariationsList() {
  const [variations, setVariations] = useState<VariationWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedVariation, setExpandedVariation] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadVariations() {
      try {
        const result = await listAssignmentVariations();

        if (result.success && result.data) {
          setVariations(result.data as VariationWithCount[]);
        } else {
          setError(result.error || 'Failed to load variations');
        }
      } catch {
        setError('An error occurred while loading variations');
      } finally {
        setLoading(false);
      }
    }

    loadVariations();
  }, []);

  const handleOpenVariation = (slug: string) => {
    router.push(`/scm/podsie/variations/${slug}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Assignment Variations
        </h1>
        <p className="text-gray-600">
          Browse Version B assignments - static, state-test-style questions
        </p>
      </div>

      {variations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            No assignment variations found
          </p>
          <p className="text-gray-400">
            Create your first variation using the skill:
            <code className="ml-2 px-2 py-1 bg-gray-100 rounded">
              /create-assignment-variation
            </code>
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Group variations by unit */}
          {Object.entries(
            variations.reduce((groups, variation) => {
              const unitKey = variation.unitNumber !== undefined
                ? `Unit ${variation.unitNumber}`
                : 'No Unit';
              if (!groups[unitKey]) {
                groups[unitKey] = [];
              }
              groups[unitKey].push(variation);
              return groups;
            }, {} as Record<string, VariationWithCount[]>)
          )
            .sort(([a], [b]) => {
              // Sort by unit number, "No Unit" goes last
              if (a === 'No Unit') return 1;
              if (b === 'No Unit') return -1;
              const numA = parseInt(a.replace('Unit ', ''));
              const numB = parseInt(b.replace('Unit ', ''));
              return numA - numB;
            })
            .map(([unitName, unitVariations]) => (
              <div key={unitName}>
                <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  {unitName}
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {unitVariations
                    .sort((a, b) => (a.lessonNumber || 0) - (b.lessonNumber || 0))
                    .map((variation) => (
                      <div
                        key={variation.slug}
                        className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <button
                          onClick={() => handleOpenVariation(variation.slug)}
                          className="block p-6 text-left w-full cursor-pointer"
                        >
                          <div className="mb-4 flex items-center gap-2 flex-wrap">
                            <span className="inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded">
                              Grade {variation.grade}
                            </span>
                            {variation.lessonNumber !== undefined && (
                              <span className="inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded">
                                Lesson {variation.lessonNumber}
                              </span>
                            )}
                            {variation.section && (
                              <span className="inline-block px-2 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded">
                                Section {variation.section}
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {variation.title}
                          </h3>

                          {variation.originalAssignmentName && (
                            <p className="text-sm text-gray-600 mb-2">
                              Based on: {variation.originalAssignmentName}
                            </p>
                          )}

                          <p className="text-xs text-gray-500">
                            {variation.questionCount} question{variation.questionCount !== 1 ? 's' : ''}
                          </p>

                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>
                                {variation.generatedBy === 'ai' ? '🤖 AI Generated' : '✍️ Manual'}
                              </span>
                              <span>
                                {new Date(variation.createdAt!).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </button>

                        {/* Expandable section for questions preview */}
                        {variation.questions && variation.questions.length > 0 && (
                          <div className="border-t border-gray-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedVariation(expandedVariation === variation.slug ? null : variation.slug);
                              }}
                              className="w-full px-6 py-3 text-left text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-between cursor-pointer"
                            >
                              <span>Question Preview</span>
                              <svg
                                className={`w-4 h-4 transition-transform ${expandedVariation === variation.slug ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {expandedVariation === variation.slug && (
                              <div className="px-6 pb-4">
                                <ul className="space-y-2 text-xs text-gray-600">
                                  {variation.questions.slice(0, 3).map((q, idx) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="mr-2 font-semibold text-gray-800">Q{q.questionNumber}:</span>
                                      <span className="truncate">{q.questionTitle}</span>
                                    </li>
                                  ))}
                                  {variation.questions.length > 3 && (
                                    <li className="text-gray-400 italic">
                                      + {variation.questions.length - 3} more questions
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
