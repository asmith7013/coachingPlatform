"use client";

import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useDeactivatedDecks, deactivatedDecksKeys, workedExampleDecksKeys } from "../hooks";
import type { WorkedExampleDeck } from "@zod-schema/scm/worked-example";
import { Spinner } from "@/components/core/feedback/Spinner";
import { ConfirmationDialog } from "@/components/composed/dialogs/ConfirmationDialog";
import { ArrowLeftIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { reactivateDeck } from "@/app/actions/worked-examples";

// Grade order for sorting
const GRADE_ORDER: Record<string, number> = {
  "6": 1,
  "7": 2,
  "8": 3,
  "Algebra 1": 4,
};

export default function DeactivatedPresentations() {
  const [reactivateModalDeck, setReactivateModalDeck] = useState<WorkedExampleDeck | null>(null);
  const [isReactivating, setIsReactivating] = useState(false);
  const queryClient = useQueryClient();

  const { decks, loading, error } = useDeactivatedDecks();

  // Sort decks by grade, then unit, then lesson
  const sortedDecks = useMemo(() => {
    return [...decks].sort((a, b) => {
      // Sort by grade first
      const gradeA = GRADE_ORDER[a.gradeLevel] || 99;
      const gradeB = GRADE_ORDER[b.gradeLevel] || 99;
      if (gradeA !== gradeB) return gradeA - gradeB;

      // Then by unit
      const unitA = a.unitNumber ?? 999;
      const unitB = b.unitNumber ?? 999;
      if (unitA !== unitB) return unitA - unitB;

      // Then by lesson
      const lessonA = a.lessonNumber ?? 999;
      const lessonB = b.lessonNumber ?? 999;
      return lessonA - lessonB;
    });
  }, [decks]);

  // Group decks by grade for display
  const decksByGrade = useMemo(() => {
    const groups: Record<string, WorkedExampleDeck[]> = {};
    for (const deck of sortedDecks) {
      const gradeKey = deck.gradeLevel === 'Algebra 1' ? 'Algebra 1' : `Grade ${deck.gradeLevel}`;
      if (!groups[gradeKey]) {
        groups[gradeKey] = [];
      }
      groups[gradeKey].push(deck);
    }
    return groups;
  }, [sortedDecks]);

  const handleReactivateClick = (deck: WorkedExampleDeck) => {
    setReactivateModalDeck(deck);
  };

  const handleConfirmReactivate = async () => {
    if (!reactivateModalDeck) return;

    setIsReactivating(true);
    try {
      const result = await reactivateDeck(reactivateModalDeck.slug);
      if (result.success) {
        // Invalidate both queries to refresh both lists
        queryClient.invalidateQueries({ queryKey: deactivatedDecksKeys.all });
        queryClient.invalidateQueries({ queryKey: workedExampleDecksKeys.all });
        setReactivateModalDeck(null);
      } else {
        console.error('Failed to reactivate:', result.error);
      }
    } catch (error) {
      console.error('Error reactivating deck:', error);
    } finally {
      setIsReactivating(false);
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
          <Link
            href="/scm/workedExamples"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Worked Examples
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Deactivated Worked Examples
          </h1>
          <p className="text-gray-600">
            View and reactivate previously deactivated presentations
          </p>
        </div>

        {sortedDecks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              No deactivated presentations found
            </p>
            <Link
              href="/scm/workedExamples"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Return to active presentations
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(decksByGrade)
              .sort(([a], [b]) => {
                const gradeA = GRADE_ORDER[a.replace('Grade ', '')] || GRADE_ORDER[a] || 99;
                const gradeB = GRADE_ORDER[b.replace('Grade ', '')] || GRADE_ORDER[b] || 99;
                return gradeA - gradeB;
              })
              .map(([gradeName, gradeDecks]) => (
                <div key={gradeName}>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    {gradeName}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({gradeDecks.length} {gradeDecks.length === 1 ? 'deck' : 'decks'})
                    </span>
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {gradeDecks.map((deck) => (
                      <div
                        key={deck.slug}
                        className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {deck.unitNumber !== undefined && (
                                <span className="inline-block px-2 py-0.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded">
                                  Unit {deck.unitNumber}
                                </span>
                              )}
                              {deck.lessonNumber !== undefined && (
                                <span className="inline-block px-2 py-0.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded">
                                  Lesson {deck.lessonNumber}
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 truncate">
                              {deck.title}
                            </h3>
                            {deck.createdAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                Created: {new Date(deck.createdAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleReactivateClick(deck)}
                            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Reactivate this worked example"
                          >
                            <ArrowPathIcon className="w-4 h-4" />
                            Reactivate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Reactivate Confirmation Modal */}
      <ConfirmationDialog
        isOpen={!!reactivateModalDeck}
        onClose={() => setReactivateModalDeck(null)}
        onConfirm={handleConfirmReactivate}
        title="Reactivate Worked Example"
        message={`Are you sure you want to reactivate "${reactivateModalDeck?.title}"? It will be visible in the main list again.`}
        confirmText="Reactivate"
        cancelText="Cancel"
        variant="info"
        isLoading={isReactivating}
      />
    </>
  );
}
