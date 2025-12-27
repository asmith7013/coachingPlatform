"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkedExampleDecks, useGradeUnitPairs, workedExampleDecksKeys } from "./hooks";
import type { WorkedExampleDeck } from "@zod-schema/scm/worked-example";
import { Spinner } from "@/components/core/feedback/Spinner";
import { PresentationModal } from "@/components/presentations/PresentationModal";
import { ChevronDownIcon, TrashIcon } from "@heroicons/react/24/outline";
import { deactivateDeck } from "@/app/actions/worked-examples";

// Map URL param to scopeSequenceTag in database
const GRADE_OPTIONS = [
  { value: "", label: "All Grades", scopeSequenceTag: "" },
  { value: "6", label: "Grade 6", scopeSequenceTag: "Grade 6" },
  { value: "7", label: "Grade 7", scopeSequenceTag: "Grade 7" },
  { value: "8", label: "Grade 8", scopeSequenceTag: "Grade 8" },
  { value: "alg1", label: "Algebra 1", scopeSequenceTag: "Algebra 1" },
];

export default function PresentationsList() {
  const [expandedDeck, setExpandedDeck] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const openSlug = searchParams.get("view");
  const slideParam = searchParams.get("slide");
  const initialSlide = slideParam ? Math.max(0, parseInt(slideParam, 10) - 1) : 0; // Convert 1-indexed URL to 0-indexed
  const gradeFilter = searchParams.get("grade") || "";

  // Get scopeSequenceTag from grade filter
  const scopeSequenceTag = useMemo(() => {
    return GRADE_OPTIONS.find((o) => o.value === gradeFilter)?.scopeSequenceTag || "";
  }, [gradeFilter]);

  // Data fetching with React Query
  const { decks, loading, error } = useWorkedExampleDecks();
  const { gradeUnitPairs } = useGradeUnitPairs(scopeSequenceTag);

  // Filter decks based on grade/unit pairs
  const filteredDecks = useMemo(() => {
    if (!gradeFilter) return decks;
    if (gradeUnitPairs.length === 0) return [];

    // Filter by matching deck's gradeLevel and unitNumber to any pair in the curriculum
    return decks.filter(
      (deck) =>
        deck.unitNumber !== undefined &&
        gradeUnitPairs.some(
          (pair) => pair.grade === deck.gradeLevel && pair.unitNumber === deck.unitNumber
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
    params.delete('slide');
    router.push(`/scm/workedExamples${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
  };

  const handleSlideChange = (slideIndex: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('slide', String(slideIndex + 1)); // Convert 0-indexed to 1-indexed for URL
    router.replace(`/scm/workedExamples?${params.toString()}`, { scroll: false });
  };

  const handleDeactivate = async (slug: string, title: string) => {
    if (!confirm(`Are you sure you want to deactivate "${title}"?\n\nThis will hide the deck from the list. You can reactivate it later from the Deactivated page.`)) {
      return;
    }

    setDeactivating(slug);
    try {
      const result = await deactivateDeck(slug);
      if (result.success) {
        // Refresh the list
        queryClient.invalidateQueries({ queryKey: workedExampleDecksKeys.all });
      } else {
        alert(result.error || 'Failed to deactivate deck');
      }
    } catch {
      alert('Failed to deactivate deck');
    } finally {
      setDeactivating(null);
    }
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
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900">
                  Worked Example Presentations
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  PPTX Format
                </span>
              </div>
              <p className="text-gray-600">
                Browse and view scaffolded guidance slide decks (960×540px, light theme)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/scm/workedExamples/deactivated"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <TrashIcon className="w-4 h-4" />
                Deactivated
              </a>
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
              <a
                href="/scm/workedExamples/create"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New
              </a>
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
                          className="relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
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
                                <div className="flex items-center gap-2">
                                  <span>
                                    {deck.isPublic ? '🌐 Public' : '🔒 Private'}
                                  </span>
                                  {deck.googleSlidesUrl && (
                                    <a
                                      href={deck.googleSlidesUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded transition-colors"
                                      title="Open in Google Slides"
                                    >
                                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-9 15H6v-4.5h4.5V18zm0-6H6v-4.5h4.5V12zm6 6h-4.5v-4.5H16.5V18zm0-6h-4.5v-4.5H16.5V12z" />
                                      </svg>
                                      Slides
                                    </a>
                                  )}
                                </div>
                                <span>
                                  {new Date(deck.createdAt!).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </button>

                          {/* Deactivate button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeactivate(deck.slug, deck.title);
                            }}
                            disabled={deactivating === deck.slug}
                            className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                            title="Deactivate deck"
                          >
                            {deactivating === deck.slug ? (
                              <Spinner size="sm" />
                            ) : (
                              <TrashIcon className="w-4 h-4" />
                            )}
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
          initialSlide={initialSlide}
          onSlideChange={handleSlideChange}
        />
      )}
    </>
  );
}
