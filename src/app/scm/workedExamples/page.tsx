"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { listWorkedExampleDecks } from '@/app/actions/worked-examples';
import type { WorkedExampleDeck } from '@zod-schema/worked-example-deck';
import { Spinner } from '@/components/core/feedback/Spinner';
import { PresentationModal } from '@/components/presentations/PresentationModal';

export default function PresentationsList() {
  const [decks, setDecks] = useState<WorkedExampleDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDeck, setExpandedDeck] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const openSlug = searchParams.get('view');

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

  const handleOpenPresentation = (slug: string) => {
    router.push(`/scm/workedExamples?view=${slug}`, { scroll: false });
  };

  const handleClosePresentation = () => {
    router.push('/scm/workedExamples', { scroll: false });
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Worked Example Presentations
          </h1>
          <p className="text-gray-600">
            Browse and view scaffolded guidance slide decks
          </p>
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
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
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
                      Grade {deck.gradeLevel}
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

                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {deck.title}
                  </h2>

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
                      className="w-full px-6 py-3 text-left text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-between"
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
