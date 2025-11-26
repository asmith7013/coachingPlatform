"use server";

import { withDbConnection } from '@server/db/ensure-connection';
import { WorkedExampleDeck } from '@mongoose-schema/worked-example-deck.model';
import { CreateWorkedExampleDeckSchema, type CreateWorkedExampleDeckInput } from '@zod-schema/worked-example-deck';
import { auth } from '@clerk/nextjs/server';
import { handleServerError } from '@error/handlers/server';

export async function saveWorkedExampleDeck(deckData: CreateWorkedExampleDeckInput) {
  return withDbConnection(async () => {
    try {
      const { userId } = await auth();

      if (!userId) {
        return {
          success: false,
          error: 'Unauthorized. Please sign in to save a deck.',
        };
      }

      // Validate input with Zod
      const validated = CreateWorkedExampleDeckSchema.parse(deckData);

      // Check if slug already exists
      const existingDeck = await WorkedExampleDeck.findOne({ slug: validated.slug });
      if (existingDeck) {
        return {
          success: false,
          error: `A deck with slug "${validated.slug}" already exists. Please use a different slug.`,
        };
      }

      // Create the deck
      const deck = await WorkedExampleDeck.create({
        ...validated,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        success: true,
        data: deck.toJSON(),
        deckId: deck._id.toString(),
        slug: deck.slug,
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, 'Failed to save worked example deck'),
      };
    }
  });
}
