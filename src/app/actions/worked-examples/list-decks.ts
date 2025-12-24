"use server";

import { withDbConnection } from '@server/db/ensure-connection';
import { WorkedExampleDeck } from '@mongoose-schema/worked-example-deck.model';
import { auth } from '@clerk/nextjs/server';
import { handleServerError } from '@error/handlers/server';

interface ListDecksFilters {
  gradeLevel?: string; // "6", "7", "8", "Algebra 1"
  mathConcept?: string;
  mathStandard?: string;
  createdBy?: string;
  isPublic?: boolean;
  deactivated?: boolean; // Filter by deactivation status (defaults to false)
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

      // Deactivation filter - default to showing only active decks
      if (filters?.deactivated !== undefined) {
        query.deactivated = filters.deactivated;
      } else {
        // Default: exclude deactivated decks (show active only)
        query.deactivated = { $ne: true };
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
        .select('title slug mathConcept mathStandard gradeLevel unitNumber lessonNumber learningGoals createdBy isPublic deactivated googleSlidesUrl createdAt'); // Light projection for list view

      const total = await WorkedExampleDeck.countDocuments(query);

      return {
        success: true,
        data: decks.map(d => {
          const json = d.toJSON();
          // Convert ObjectId to string for client compatibility
          return {
            ...json,
            _id: d._id.toString(),
            id: d._id.toString(),
          };
        }),
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
