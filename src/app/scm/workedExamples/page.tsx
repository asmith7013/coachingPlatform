"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { listWorkedExampleDecks } from '@/app/actions/worked-examples';
import { getGradeUnitPairsByTag } from '@/app/actions/313/scope-and-sequence';
import type { WorkedExampleDeck } from '@zod-schema/worked-example-deck';
import { Spinner } from '@/components/core/feedback/Spinner';
import { PresentationModal } from '@/components/presentations/PresentationModal';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

// Map URL param to scopeSequenceTag in database
const GRADE_OPTIONS = [
  { value: '', label: 'All Grades', scopeSequenceTag: '' },
  { value: '6', label: 'Grade 6', scopeSequenceTag: 'Grade 6' },
  { value: '7', label: 'Grade 7', scopeSequenceTag: 'Grade 7' },
  { value: '8', label: 'Grade 8', scopeSequenceTag: 'Grade 8' },
  { value: 'alg1', label: 'Algebra 1', scopeSequenceTag: 'Algebra 1' },
];

export default function PresentationsList() {
  const [decks, setDecks] = useState<WorkedExampleDeck[]>([]);
  const [gradeUnitPairs, setGradeUnitPairs] = useState<Array<{ grade: string; unitNumber: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDeck, setExpandedDeck] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const openSlug = searchParams.get('view');
  const gradeFilter = searchParams.get('grade') || '';

  // Load decks on mount
  useEffect(() => {
    async function loadDecks() {
      try {
        const result = await listWorkedExampleDecks();

        if (result.success && result.data) {
          setDecks(result.data as WorkedExampleDeck[]);
        } else {
          setError(result.error || 'Failed to load presentations');
        }
      } catch {
        setError('An error occurred while loading presentations');
      } finally {
        setLoading(false);
      }
    }

    loadDecks();
  }, []);

  // Load grade/unit pairs when grade filter changes
  useEffect(() => {
    async function loadGradeUnitPairs() {
      const scopeSequenceTag = GRADE_OPTIONS.find(o => o.value === gradeFilter)?.scopeSequenceTag;
      if (!scopeSequenceTag) {
        setGradeUnitPairs([]);
        return;
      }

      const result = await getGradeUnitPairsByTag(scopeSequenceTag);
      if (result.success && result.data) {
        setGradeUnitPairs(result.data);
      }
    }

    loadGradeUnitPairs();
  }, [gradeFilter]);

  // Filter decks based on grade/unit pairs
  const filteredDecks = useMemo(() => {
    if (!gradeFilter) return decks;
    if (gradeUnitPairs.length === 0) return [];

    // Filter by matching deck's gradeLevel and unitNumber to any pair in the curriculum
    return decks.filter((deck) =>
      deck.unitNumber !== undefined &&
      gradeUnitPairs.some(pair =>
        pair.grade === deck.gradeLevel && pair.unitNumber === deck.unitNumber
      )
    );
  }, [decks, gradeFilter, gradeUnitPairs]);

  const handleGradeChange = (newGrade: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newGrade) {
      params.set('grade', newGrade);
    } else {
      params.delete('grade');
    }
    // Preserve the view param if it exists
    router.push(`/scm/workedExamples${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
  };

  const handleOpenPresentation = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', slug);
    router.push(`/scm/workedExamples?${params.toString()}`, { scroll: false });
  };

  const handleClosePresentation = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('view');
    router.push(`/scm/workedExamples${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
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
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Worked Example Presentations
              </h1>
              <p className="text-gray-600">
                Browse and view scaffolded guidance slide decks
              </p>
            </div>
            <div className="relative">
              <select
                value={gradeFilter}
                onChange={(e) => handleGradeChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              >
                {GRADE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {decks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              No presentations found
            </p>
            <p className="text-gray-400">
              Create your first worked example using the skill:
              <code className="ml-2 px-2 py-1 bg-gray-100 rounded">
                /create-worked-example-sg
              </code>
            </p>
          </div>
        ) : filteredDecks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              No presentations found for {GRADE_OPTIONS.find(o => o.value === gradeFilter)?.label || 'selected grade'}
            </p>
            <button
              onClick={() => handleGradeChange('')}
              className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            >
              Show all grades
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Group decks by unit */}
            {Object.entries(
              filteredDecks.reduce((groups, deck) => {
                const unitKey = deck.unitNumber !== undefined
                  ? `Unit ${deck.unitNumber}`
                  : 'No Unit';
                if (!groups[unitKey]) {
                  groups[unitKey] = [];
                }
                groups[unitKey].push(deck);
                return groups;
              }, {} as Record<string, WorkedExampleDeck[]>)
            )
              .sort(([a], [b]) => {
                // Sort by unit number, "No Unit" goes last
                if (a === 'No Unit') return 1;
                if (b === 'No Unit') return -1;
                const numA = parseInt(a.replace('Unit ', ''));
                const numB = parseInt(b.replace('Unit ', ''));
                return numA - numB;
              })
              .map(([unitName, unitDecks]) => (
                <div key={unitName}>
                  <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    {unitName}
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {unitDecks
                      .sort((a, b) => (a.lessonNumber || 0) - (b.lessonNumber || 0))
                      .map((deck) => (
                        <div
                          key={deck.slug}
                          className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <button
                            onClick={() => handleOpenPresentation(deck.slug)}
                            className="block p-6 text-left w-full cursor-pointer"
                          >
                            <div className="mb-4 flex items-center gap-2 flex-wrap">
                              <span className="inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded">
                                {deck.gradeLevel === 'Algebra 1' ? 'Algebra 1' : `Grade ${deck.gradeLevel}`}
                              </span>
                              {deck.lessonNumber !== undefined && (
                                <span className="inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded">
                                  Lesson {deck.lessonNumber}
                                </span>
                              )}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {deck.title}
                            </h3>

                            <p className="text-sm text-gray-600 mb-2">
                              {deck.mathConcept}
                            </p>

                            <p className="text-xs text-gray-500">
                              Standard: {deck.mathStandard}
                            </p>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>
                                  {deck.isPublic ? '🌐 Public' : '🔒 Private'}
                                </span>
                                <span>
                                  {new Date(deck.createdAt!).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </button>

                          {/* Expandable section for learning goals */}
                          {deck.learningGoals && deck.learningGoals.length > 0 && (
                            <div className="border-t border-gray-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedDeck(expandedDeck === deck.slug ? null : deck.slug);
                                }}
                                className="w-full px-6 py-3 text-left text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-between cursor-pointer"
                              >
                                <span>Learning Goals</span>
                                <svg
                                  className={`w-4 h-4 transition-transform ${expandedDeck === deck.slug ? 'rotate-180' : ''}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              {expandedDeck === deck.slug && (
                                <div className="px-6 pb-4">
                                  <ul className="space-y-1 text-xs text-gray-600">
                                    {deck.learningGoals.map((goal, idx) => (
                                      <li key={idx} className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{goal}</span>
                                      </li>
                                    ))}
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

      {/* Presentation Modal */}
      {openSlug && (
        <PresentationModal
          slug={openSlug}
          isOpen={!!openSlug}
          onClose={handleClosePresentation}
        />
      )}
    </>
  );
}
