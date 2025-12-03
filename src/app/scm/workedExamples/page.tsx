"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listWorkedExampleDecks } from '@/app/actions/worked-examples';
import type { WorkedExampleDeck } from '@zod-schema/worked-example-deck';

export default function PresentationsList() {
  const [decks, setDecks] = useState<WorkedExampleDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-lg">Loading presentations...</p>
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
            <Link
              key={deck.slug}
              href={`/scm/workedExamples/${deck.slug}`}
              className="block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                <span className="inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded">
                  Grade {deck.gradeLevel}
                </span>
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
