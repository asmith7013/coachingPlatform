"use server";

import { withDbConnection } from '@server/db/ensure-connection';
import { WorkedExampleDeck } from '@mongoose-schema/worked-example-deck.model';
import { auth } from '@clerk/nextjs/server';
import { handleServerError } from '@error/handlers/server';

export async function getDeckBySlug(slug: string) {
  return withDbConnection(async () => {
    try {
      const { userId } = await auth();

      const deck = await WorkedExampleDeck.findOne({ slug });

      if (!deck) {
        return {
          success: false,
          error: 'Deck not found',
        };
      }

      // Check permissions: public decks or owned by user
      if (!deck.isPublic && deck.createdBy !== userId) {
        return {
          success: false,
          error: 'You do not have permission to view this deck',
        };
      }

      // Convert to plain object and serialize ObjectIds
      const plainDeck = JSON.parse(JSON.stringify(deck.toJSON()));

      return {
        success: true,
        data: plainDeck,
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, 'Failed to retrieve deck'),
      };
    }
  });
}

/**
 * Get just the lesson summary HTML for a deck (lightweight query).
 * Returns the summary + basic metadata without loading the full deck.
 */
export async function getLessonSummaryBySlug(slug: string) {
  return withDbConnection(async () => {
    try {
      const { userId } = await auth();

      const deck = await WorkedExampleDeck.findOne(
        { slug },
        {
          lessonSummaryHtml: 1,
          title: 1,
          slug: 1,
          gradeLevel: 1,
          unitNumber: 1,
          lessonNumber: 1,
          isPublic: 1,
          createdBy: 1,
        },
      );

      if (!deck) {
        return {
          success: false,
          error: 'Deck not found',
        };
      }

      // Check permissions: public decks or owned by user
      if (!deck.isPublic && deck.createdBy !== userId) {
        return {
          success: false,
          error: 'You do not have permission to view this deck',
        };
      }

      if (!deck.lessonSummaryHtml) {
        return {
          success: false,
          error: 'No lesson summary available for this deck',
        };
      }

      return {
        success: true,
        data: {
          lessonSummaryHtml: deck.lessonSummaryHtml,
          title: deck.title,
          slug: deck.slug,
          gradeLevel: deck.gradeLevel,
          unitNumber: deck.unitNumber,
          lessonNumber: deck.lessonNumber,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, 'Failed to retrieve lesson summary'),
      };
    }
  });
}

export async function getDeckById(deckId: string) {
  return withDbConnection(async () => {
    try {
      const { userId } = await auth();

      const deck = await WorkedExampleDeck.findById(deckId);

      if (!deck) {
        return {
          success: false,
          error: 'Deck not found',
        };
      }

      // Check permissions
      if (!deck.isPublic && deck.createdBy !== userId) {
        return {
          success: false,
          error: 'You do not have permission to view this deck',
        };
      }

      // Convert to plain object and serialize ObjectIds
      const plainDeck = JSON.parse(JSON.stringify(deck.toJSON()));

      return {
        success: true,
        data: plainDeck,
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, 'Failed to retrieve deck'),
      };
    }
  });
}
