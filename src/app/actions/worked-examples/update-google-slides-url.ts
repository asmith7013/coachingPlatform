"use server";

import { withDbConnection } from '@server/db/ensure-connection';
import { WorkedExampleDeck } from '@mongoose-schema/worked-example-deck.model';
import { auth } from '@clerk/nextjs/server';
import { handleServerError } from '@error/handlers/server';

export async function updateGoogleSlidesUrl(deckId: string, googleSlidesUrl: string) {
  return withDbConnection(async () => {
    try {
      const { userId } = await auth();

      if (!userId) {
        return {
          success: false,
          error: 'Unauthorized. Please sign in to update the deck.',
        };
      }

      // Update the deck with the Google Slides URL
      const updatedDeck = await WorkedExampleDeck.findByIdAndUpdate(
        deckId,
        {
          googleSlidesUrl,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!updatedDeck) {
        return {
          success: false,
          error: 'Deck not found.',
        };
      }

      return {
        success: true,
        data: updatedDeck.toJSON(),
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, 'Failed to update Google Slides URL'),
      };
    }
  });
}
