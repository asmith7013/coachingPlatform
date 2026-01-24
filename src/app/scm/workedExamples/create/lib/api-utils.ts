/**
 * Server-side utilities for AI API routes.
 * These are shared across worked example API endpoints to reduce duplication.
 */

import type Anthropic from "@anthropic-ai/sdk";

type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

/**
 * Parse a base64 data URL and extract media type and data.
 * Used to convert client-provided images to Anthropic API format.
 *
 * @param dataUrl - Base64 data URL (e.g., "data:image/png;base64,...")
 * @returns Parsed media type and data, or null if invalid
 */
export function parseDataUrl(dataUrl: string): {
  mediaType: ImageMediaType;
  data: string;
} | null {
  const match = dataUrl.match(
    /^data:(image\/(jpeg|png|gif|webp));base64,(.+)$/,
  );
  if (!match) return null;
  return {
    mediaType: match[1] as ImageMediaType,
    data: match[3],
  };
}

/**
 * Strip markdown code fences from AI response text.
 * AI models often wrap responses in ```html or ```json blocks.
 *
 * @param text - Raw text from AI response
 * @param type - Expected content type ('html' | 'json'), used to remove type-specific fences
 * @returns Cleaned text without markdown fences
 */
export function stripMarkdownFences(
  text: string,
  type?: "html" | "json",
): string {
  let result = text.trim();

  // Remove opening fence
  if (type && result.startsWith(`\`\`\`${type}`)) {
    result = result.slice(3 + type.length);
  } else if (result.startsWith("```")) {
    result = result.slice(3);
  }

  // Remove closing fence
  if (result.endsWith("```")) {
    result = result.slice(0, -3);
  }

  return result.trim();
}

/**
 * Extract text content from an Anthropic API response.
 *
 * @param response - Anthropic Message response
 * @returns Text content or null if no text block found
 */
export function extractTextContent(response: Anthropic.Message): string | null {
  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    return null;
  }
  return textContent.text;
}

/**
 * Build message content array for Anthropic API with optional images.
 * Images are added before the text prompt (Anthropic convention).
 *
 * @param images - Array of base64 data URLs (optional)
 * @param textPrompt - Text prompt to send
 * @returns Message content array ready for Anthropic API
 */
export function buildMessageContent(
  images: string[] | undefined,
  textPrompt: string,
): Anthropic.MessageCreateParams["messages"][0]["content"] {
  const content: Anthropic.MessageCreateParams["messages"][0]["content"] = [];

  // Add images first if provided
  if (images && images.length > 0) {
    for (const dataUrl of images) {
      const parsed = parseDataUrl(dataUrl);
      if (parsed) {
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: parsed.mediaType,
            data: parsed.data,
          },
        });
      }
    }
  }

  // Add text prompt
  content.push({
    type: "text",
    text: textPrompt,
  });

  return content;
}
