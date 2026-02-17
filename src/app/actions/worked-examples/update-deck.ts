"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { WorkedExampleDeck } from "@mongoose-schema/worked-example-deck.model";
import { type HtmlSlide } from "@zod-schema/scm/worked-example";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { handleServerError } from "@error/handlers/server";

interface UpdateDeckSlidesInput {
  slug: string;
  htmlSlides: HtmlSlide[];
  lessonSummaryHtml?: string;
  lessonSummarySlideNumber?: number;
}

/**
 * Update the slides of an existing worked example deck.
 * Only the owner can update a deck.
 * Used for auto-save when editing an existing deck (editSlug mode).
 */
export async function updateDeckSlides(input: UpdateDeckSlidesInput) {
  return withDbConnection(async () => {
    try {
      const authResult = await getAuthenticatedUser();

      if (!authResult.success) {
        return {
          success: false,
          error: "Unauthorized. Please sign in to update a deck.",
        };
      }

      const { email, userId } = authResult.data;
      const userIdentifier = email || userId;

      // Find the existing deck
      const existingDeck = await WorkedExampleDeck.findOne({
        slug: input.slug,
      });

      if (!existingDeck) {
        return {
          success: false,
          error: `Deck not found: ${input.slug}`,
        };
      }

      // Check ownership - only the creator can update
      if (existingDeck.createdBy !== userIdentifier) {
        return {
          success: false,
          error: "You do not have permission to update this deck.",
        };
      }

      // Validate slides have required fields
      for (const slide of input.htmlSlides) {
        if (!slide.slideNumber || !slide.htmlContent) {
          return {
            success: false,
            error:
              "Invalid slide data: each slide must have slideNumber and htmlContent",
          };
        }
      }

      // Update the deck's slides and lesson summary fields
      const updateFields: Record<string, unknown> = {
        htmlSlides: input.htmlSlides,
        updatedAt: new Date(),
      };
      if (input.lessonSummaryHtml !== undefined) {
        updateFields.lessonSummaryHtml = input.lessonSummaryHtml;
      }
      if (input.lessonSummarySlideNumber !== undefined) {
        updateFields.lessonSummarySlideNumber = input.lessonSummarySlideNumber;
      }

      const updatedDeck = await WorkedExampleDeck.findByIdAndUpdate(
        existingDeck._id,
        updateFields,
        { new: true },
      );

      if (!updatedDeck) {
        return {
          success: false,
          error: "Failed to update deck",
        };
      }

      return {
        success: true,
        slug: updatedDeck.slug,
        updatedAt: updatedDeck.updatedAt,
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to update deck slides"),
      };
    }
  });
}
