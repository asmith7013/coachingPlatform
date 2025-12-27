"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listWorkedExampleDecks, reactivateDeck } from "@/app/actions/worked-examples";
import { workedExampleDecksKeys } from "../hooks";
import type { WorkedExampleDeck } from "@zod-schema/scm/worked-example";
import { Spinner } from "@/components/core/feedback/Spinner";
import { ArrowPathIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function DeactivatedDecksPage() {
  const [reactivating, setReactivating] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch deactivated decks
  const { data: decks = [], isLoading, error } = useQuery({
    queryKey: ["worked-example-decks", "deactivated"],
    queryFn: async () => {
      const result = await listWorkedExampleDecks({ deactivated: true });
      if (!result.success) {
        throw new Error(result.error || "Failed to load deactivated decks");
      }
      return result.data as WorkedExampleDeck[];
    },
  });

  const handleReactivate = async (slug: string, title: string) => {
    if (!confirm(`Reactivate "${title}"?\n\nThis will restore the deck to the main list.`)) {
      return;
    }

    setReactivating(slug);
    try {
      const result = await reactivateDeck(slug);
      if (result.success) {
        // Refresh both lists
        queryClient.invalidateQueries({ queryKey: ["worked-example-decks", "deactivated"] });
        queryClient.invalidateQueries({ queryKey: workedExampleDecksKeys.all });
      } else {
        alert(result.error || "Failed to reactivate deck");
      }
    } catch {
      alert("Failed to reactivate deck");
    } finally {
      setReactivating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <a
            href="/scm/workedExamples"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 cursor-pointer"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Active Decks
          </a>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Deactivated Presentations
        </h1>
        <p className="text-gray-600">
          These decks have been deactivated and are hidden from the main list.
          Reactivate them to restore them.
        </p>
      </div>

      {decks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg mb-2">
            No deactivated presentations
          </p>
          <p className="text-gray-400 text-sm">
            Deactivated presentations will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <div
              key={deck.slug}
              className="relative bg-white rounded-lg border border-gray-200 shadow-sm p-6"
            >
              <div className="mb-4 flex items-center gap-2 flex-wrap">
                <span className="inline-block px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded">
                  {deck.gradeLevel === "Algebra 1"
                    ? "Algebra 1"
                    : `Grade ${deck.gradeLevel}`}
                </span>
                {deck.unitNumber !== undefined && (
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded">
                    Unit {deck.unitNumber}
                  </span>
                )}
                {deck.lessonNumber !== undefined && (
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded">
                    Lesson {deck.lessonNumber}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-700 mb-2">
                {deck.title}
              </h3>

              <p className="text-sm text-gray-500 mb-2">{deck.mathConcept}</p>

              <p className="text-xs text-gray-400">
                Standard: {deck.mathStandard}
              </p>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {new Date(deck.createdAt!).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleReactivate(deck.slug, deck.title)}
                  disabled={reactivating === deck.slug}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {reactivating === deck.slug ? (
                    <Spinner size="sm" />
                  ) : (
                    <ArrowPathIcon className="w-4 h-4" />
                  )}
                  Reactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
