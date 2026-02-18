"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { WorkedExampleDeck } from "@mongoose-schema/worked-example-deck.model";
import { getAuthenticatedUser } from "@server/auth/getAuthenticatedUser";
import { handleServerError } from "@error/handlers/server";

/**
 * Toggle the deactivated status of a worked example deck.
 * Only the deck owner or super admins can deactivate/reactivate decks.
 */
export async function toggleDeckDeactivated(
  slug: string,
  deactivated: boolean,
) {
  return withDbConnection(async () => {
    try {
      const authResult = await getAuthenticatedUser();

      if (!authResult.success) {
        return {
          success: false,
          error: "You must be logged in to modify decks",
        };
      }

      const { email: userEmail, isSuperAdmin } = authResult.data;

      const deck = await WorkedExampleDeck.findOne({ slug });

      if (!deck) {
        return {
          success: false,
          error: "Deck not found",
        };
      }

      // Super admins can always modify, otherwise only the owner
      const isOwner = deck.createdBy === userEmail;
      if (!isOwner && !isSuperAdmin) {
        return {
          success: false,
          error: "You do not have permission to modify this deck",
        };
      }

      // Update the deactivated status
      deck.deactivated = deactivated;
      await deck.save();

      return {
        success: true,
        data: {
          slug: deck.slug,
          deactivated: deck.deactivated,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to update deck status"),
      };
    }
  });
}

/**
 * Deactivate a worked example deck (soft delete).
 */
export async function deactivateDeck(slug: string) {
  return toggleDeckDeactivated(slug, true);
}

/**
 * Reactivate a previously deactivated deck.
 */
export async function reactivateDeck(slug: string) {
  return toggleDeckDeactivated(slug, false);
}
