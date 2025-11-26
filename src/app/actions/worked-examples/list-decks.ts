"use server";

import { withDbConnection } from '@server/db/ensure-connection';
import { WorkedExampleDeck } from '@mongoose-schema/worked-example-deck.model';
import { auth } from '@clerk/nextjs/server';
import { handleServerError } from '@error/handlers/server';

interface ListDecksFilters {
  gradeLevel?: number;
  mathConcept?: string;
  mathStandard?: string;
  createdBy?: string;
  isPublic?: boolean;
  limit?: number;
  skip?: number;
}

export async function listWorkedExampleDecks(filters?: ListDecksFilters) {
  return withDbConnection(async () => {
    try {
      const { userId } = await auth();

      const query: Record<string, unknown> = {};

      // Apply filters
      if (filters?.gradeLevel) {
        query.gradeLevel = filters.gradeLevel;
      }

      if (filters?.mathConcept) {
        query.mathConcept = filters.mathConcept;
      }

      if (filters?.mathStandard) {
        query.mathStandard = filters.mathStandard;
      }

      if (filters?.createdBy) {
        query.createdBy = filters.createdBy;
      }

      // Visibility filter - show public decks + user's own decks
      if (filters?.isPublic !== undefined) {
        query.isPublic = filters.isPublic;
      } else if (userId) {
        // Default: show public decks OR user's own decks
        query.$or = [
          { isPublic: true },
          { createdBy: userId },
        ];
      } else {
        // Not authenticated: only show public decks
        query.isPublic = true;
      }

      const decks = await WorkedExampleDeck
        .find(query)
        .sort({ createdAt: -1 })
        .limit(filters?.limit || 50)
        .skip(filters?.skip || 0)
        .select('title slug mathConcept mathStandard gradeLevel createdBy isPublic createdAt'); // Light projection for list view

      const total = await WorkedExampleDeck.countDocuments(query);

      return {
        success: true,
        data: decks.map(d => d.toJSON()),
        pagination: {
          total,
          limit: filters?.limit || 50,
          skip: filters?.skip || 0,
          hasMore: (filters?.skip || 0) + (filters?.limit || 50) < total,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, 'Failed to list worked example decks'),
      };
    }
  });
}
