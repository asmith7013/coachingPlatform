"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { WorkedExampleDeck } from "@mongoose-schema/worked-example-deck.model";
import {
  CreateWorkedExampleDeckSchema,
  type CreateWorkedExampleDeckInput,
} from "@zod-schema/scm/worked-example";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { handleServerError } from "@error/handlers/server";

export async function saveWorkedExampleDeck(
  deckData: CreateWorkedExampleDeckInput,
) {
  return withDbConnection(async () => {
    try {
      const authResult = await getAuthenticatedUser();

      if (!authResult.success) {
        return {
          success: false,
          error: "Unauthorized. Please sign in to save a deck.",
        };
      }

      const { userId, email } = authResult.data;
      const createdByName = email || userId;

      // Validate input with Zod
      const validated = CreateWorkedExampleDeckSchema.parse(deckData);

      // Generate unique slug by appending version number if needed
      let finalSlug = validated.slug;
      const existingDeck = await WorkedExampleDeck.findOne({ slug: finalSlug });
      if (existingDeck) {
        // Find all slugs that start with the base slug (e.g., "my-deck", "my-deck-v2", "my-deck-v3")
        const baseSlug = validated.slug.replace(/-v\d+$/, ""); // Remove existing version suffix
        const existingSlugs = await WorkedExampleDeck.find(
          { slug: { $regex: `^${baseSlug}(-v\\d+)?$` } },
          { slug: 1 },
        ).lean();

        // Find the highest version number
        let maxVersion = 1;
        for (const deck of existingSlugs) {
          const match = deck.slug.match(/-v(\d+)$/);
          if (match) {
            maxVersion = Math.max(maxVersion, parseInt(match[1], 10));
          }
        }

        // Generate new slug with next version
        finalSlug = `${baseSlug}-v${maxVersion + 1}`;
      }

      // Create the deck with the unique slug
      const deck = await WorkedExampleDeck.create({
        ...validated,
        slug: finalSlug, // Use the unique slug
        createdBy: createdByName,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        success: true,
        deckId: deck._id.toString(),
        slug: finalSlug,
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to save worked example deck"),
      };
    }
  });
}
