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

      return {
        success: true,
        data: deck.toJSON(),
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, 'Failed to retrieve deck'),
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

      return {
        success: true,
        data: deck.toJSON(),
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, 'Failed to retrieve deck'),
      };
    }
  });
}
