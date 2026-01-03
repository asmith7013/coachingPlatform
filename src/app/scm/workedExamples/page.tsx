"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkedExampleDecks, useGradeUnitPairs, workedExampleDecksKeys } from "./hooks";
import type { WorkedExampleDeck } from "@zod-schema/scm/worked-example";
import { Spinner } from "@/components/core/feedback/Spinner";
import { PresentationModal } from "./presentations";
import { ConfirmationDialog } from "@/components/composed/dialogs/ConfirmationDialog";
import { ChevronDownIcon, ChevronRightIcon, XMarkIcon, ArchiveBoxIcon } from "@heroicons/react/24/outline";
import { deactivateDeck } from "@/app/actions/worked-examples";
import Link from "next/link";

// Choice modal for decks with Google Slides
function ViewChoiceModal({
  deck,
  onOpenSlides,
  onOpenHtml,
  onClose,
}: {
  deck: WorkedExampleDeck;
  onOpenSlides: () => void;
  onOpenHtml: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded">
            {deck.gradeLevel === 'Algebra 1' ? 'Algebra 1' : `Grade ${deck.gradeLevel}`}
          </span>
          {deck.unitNumber !== undefined && (
            <span className="inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded">
              Unit {deck.unitNumber}
            </span>
          )}
          {deck.lessonNumber !== undefined && (
            <span className="inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded">
              Lesson {deck.lessonNumber}
            </span>
          )}
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
          {deck.title}
        </h2>
        <p className="text-gray-500 text-sm text-center mb-6">
          Choose how to view this presentation
        </p>

        <div className="grid grid-cols-2 gap-4">
          {/* Google Slides Option - Highlighted */}
          <button
            onClick={onOpenSlides}
            className="flex flex-col items-center gap-3 p-6 bg-yellow-50 border-2 border-yellow-400 rounded-xl hover:bg-yellow-100 transition-colors cursor-pointer ring-2 ring-yellow-400 ring-offset-2"
          >
            <div className="w-16 h-16 flex items-center justify-center bg-yellow-400 rounded-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="white"
                viewBox="0 0 24 24"
                className="w-8 h-8"
              >
                <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-9 15H6v-4.5h4.5V18zm0-6H6v-4.5h4.5V12zm6 6h-4.5v-4.5H16.5V18zm0-6h-4.5v-4.5H16.5V12z" />
              </svg>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">Google Slides</div>
              <div className="text-xs text-gray-500 mt-1">Opens in new tab</div>
            </div>
            <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-bold text-yellow-800 bg-yellow-300 rounded-full hidden">
              Recommended
            </span>
          </button>

          {/* HTML Option */}
          <button
            onClick={onOpenHtml}
            className="flex flex-col items-center gap-3 p-6 bg-gray-50 border-2 border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-pointer"
          >
            <div className="w-16 h-16 flex items-center justify-center bg-gray-600 rounded-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="white"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                />
              </svg>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">HTML Viewer</div>
              <div className="text-xs text-gray-500 mt-1">View on this site</div>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Map URL param to scopeSequenceTag in database
const GRADE_OPTIONS = [
  { value: "", label: "All Grades", scopeSequenceTag: "" },
  { value: "6", label: "Grade 6", scopeSequenceTag: "Grade 6" },
  { value: "7", label: "Grade 7", scopeSequenceTag: "Grade 7" },
  { value: "8", label: "Grade 8", scopeSequenceTag: "Grade 8" },
  { value: "alg1", label: "Algebra 1", scopeSequenceTag: "Algebra 1" },
];

export default function PresentationsList() {
  const [choiceModalDeck, setChoiceModalDeck] = useState<WorkedExampleDeck | null>(null);
  const [deactivateModalDeck, setDeactivateModalDeck] = useState<WorkedExampleDeck | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [openUnits, setOpenUnits] = useState<Set<string>>(new Set()); // Track open accordions - all closed by default
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

  const handleCardClick = (deck: WorkedExampleDeck) => {
    // If deck has Google Slides, show choice modal
    if (deck.googleSlidesUrl) {
      setChoiceModalDeck(deck);
    } else {
      // No Google Slides, open HTML viewer directly
      handleOpenPresentation(deck.slug);
    }
  };

  const handleOpenPresentation = (slug: string) => {
    setChoiceModalDeck(null); // Close choice modal if open
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', slug);
    router.push(`/scm/workedExamples?${params.toString()}`, { scroll: false });
  };

  const handleOpenGoogleSlides = (url: string) => {
    setChoiceModalDeck(null);
    window.open(url, '_blank');
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

  const toggleUnit = (unitName: string) => {
    setOpenUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitName)) {
        next.delete(unitName);
      } else {
        next.add(unitName);
      }
      return next;
    });
  };

  const handleDeactivateClick = (e: React.MouseEvent, deck: WorkedExampleDeck) => {
    e.stopPropagation();
    setDeactivateModalDeck(deck);
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivateModalDeck) return;

    setIsDeactivating(true);
    try {
      const result = await deactivateDeck(deactivateModalDeck.slug);
      if (result.success) {
        // Invalidate the query to refresh the list
        queryClient.invalidateQueries({ queryKey: workedExampleDecksKeys.all });
        setDeactivateModalDeck(null);
      } else {
        console.error('Failed to deactivate:', result.error);
      }
    } catch (error) {
      console.error('Error deactivating deck:', error);
    } finally {
      setIsDeactivating(false);
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
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {gradeFilter
                ? GRADE_OPTIONS.find(o => o.value === gradeFilter)?.label || 'Worked Examples'
                : 'Worked Example Presentations'}
            </h1>
            <p className="text-gray-600">
              Browse and view scaffolded guidance slide decks
            </p>
          </div>
          <Link
            href="/scm/workedExamples/deactivated"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArchiveBoxIcon className="w-4 h-4" />
            View Deactivated
          </Link>
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
              .map(([unitName, unitDecks]) => {
                const isOpen = openUnits.has(unitName);
                return (
                <div key={unitName} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleUnit(unitName)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <h2 className="text-xl font-bold text-gray-800">
                      {unitName}
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({unitDecks.length} {unitDecks.length === 1 ? 'deck' : 'decks'})
                      </span>
                    </h2>
                    {isOpen ? (
                      <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  {isOpen && (
                  <div className="p-4">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {unitDecks
                      .sort((a, b) => (a.lessonNumber || 0) - (b.lessonNumber || 0))
                      .map((deck) => (
                        <div
                          key={deck.slug}
                          className="relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
                        >
                          {/* Deactivate button */}
                          <button
                            onClick={(e) => handleDeactivateClick(e, deck)}
                            className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                            title="Deactivate this worked example"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCardClick(deck)}
                            className="block p-6 text-left w-full cursor-pointer"
                          >
                            <div className="mb-4 flex items-center gap-2 flex-wrap pr-6">
                              <span className="inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded">
                                {deck.gradeLevel === 'Algebra 1' ? 'Algebra 1' : `Grade ${deck.gradeLevel}`}
                              </span>
                              {deck.lessonNumber !== undefined && (
                                <span className="inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded">
                                  Lesson {deck.lessonNumber}
                                </span>
                              )}
                              {deck.googleSlidesUrl && (
                                <a
                                  href={deck.googleSlidesUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded transition-colors"
                                  title="Open in Google Slides"
                                >
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-9 15H6v-4.5h4.5V18zm0-6H6v-4.5h4.5V12zm6 6h-4.5v-4.5H16.5V18zm0-6h-4.5v-4.5H16.5V12z" />
                                  </svg>
                                  Slides
                                </a>
                              )}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900">
                              {deck.title}
                            </h3>

                            {/* Learning Targets Section */}
                            {deck.learningGoals && deck.learningGoals.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs font-medium text-gray-500 mb-1">
                                  Learning Targets:
                                </p>
                                <ul className="space-y-1 text-sm text-gray-600">
                                  {deck.learningGoals.map((goal, idx) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="mr-2 text-gray-400">•</span>
                                      <span>{goal}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Standard Section */}
                            {deck.mathStandard && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs font-medium text-gray-500 mb-1">
                                  Standard:
                                </p>
                                <p className="text-sm text-gray-600">{deck.mathStandard}</p>
                              </div>
                            )}

                            <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                              {/* Status Row */}
                              {!deck.isPublic && (
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>🔒 Private</span>
                                </div>
                              )}
                              {/* Creation Data Row */}
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Created:</p>
                                <p className="text-sm text-gray-600">
                                  {new Date(deck.createdAt!).toLocaleDateString()}
                                  {deck.createdBy && (
                                    <span> by {deck.createdBy}</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </button>
                        </div>
                      ))}
                  </div>
                  </div>
                  )}
                </div>
              );
              })}
          </div>
        )}
      </div>

      {/* View Choice Modal */}
      {choiceModalDeck && (
        <ViewChoiceModal
          deck={choiceModalDeck}
          onOpenSlides={() => handleOpenGoogleSlides(choiceModalDeck.googleSlidesUrl!)}
          onOpenHtml={() => handleOpenPresentation(choiceModalDeck.slug)}
          onClose={() => setChoiceModalDeck(null)}
        />
      )}

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

      {/* Deactivate Confirmation Modal */}
      <ConfirmationDialog
        isOpen={!!deactivateModalDeck}
        onClose={() => setDeactivateModalDeck(null)}
        onConfirm={handleConfirmDeactivate}
        title="Deactivate Worked Example"
        message={`Are you sure you want to deactivate "${deactivateModalDeck?.title}"? It will be hidden from the list but can be reactivated later.`}
        confirmText="Deactivate"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeactivating}
      />
    </>
  );
}
