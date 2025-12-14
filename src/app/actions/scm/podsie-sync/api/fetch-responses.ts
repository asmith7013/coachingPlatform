"use server";

import {
  PodsieApiResponseSchema,
  PodsieResponse,
} from "@zod-schema/scm/podsie/podsie-response";

// =====================================
// FUNCTION
// =====================================

/**
 * Fetch student responses from Podsie API for a given assignment
 */
export async function fetchPodsieResponses(
  assignmentId: string,
  studentEmail: string
): Promise<PodsieResponse[]> {
  const token = process.env.PODSIE_API_TOKEN;

  if (!token) {
    throw new Error("PODSIE_API_TOKEN not configured");
  }

  const response = await fetch(
    `https://www.podsie.org/api/assignments/${assignmentId}/responses`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email: studentEmail }),
    }
  );

  if (!response.ok) {
    throw new Error(`Podsie API error: ${response.status} ${response.statusText}`);
  }

  const rawData = await response.json();

  // Validate response with Zod schema
  const parseResult = PodsieApiResponseSchema.safeParse(rawData);
  if (!parseResult.success) {
    console.error("Podsie API response validation failed:", parseResult.error.issues);
    throw new Error(`Invalid Podsie API response format: ${parseResult.error.message}`);
  }

  const data = parseResult.data;

  if (!data.success) {
    throw new Error("Podsie API returned unsuccessful response");
  }

  return data.data.responses;
}
