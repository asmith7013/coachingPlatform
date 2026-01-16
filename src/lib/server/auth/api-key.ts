import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.SOLVES_COACHING_API_KEY;

/**
 * Validates the Authorization header contains a valid Bearer token.
 * Use this to protect external API endpoints.
 *
 * @example
 * ```ts
 * export async function GET(req: NextRequest) {
 *   const authError = validateApiKey(req);
 *   if (authError) return authError;
 *
 *   // ... handle request
 * }
 * ```
 */
export function validateApiKey(req: NextRequest): NextResponse | null {
  if (!API_KEY) {
    console.error("SOLVES_COACHING_API_KEY environment variable is not set");
    return NextResponse.json(
      { success: false, error: "Server configuration error" },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { success: false, error: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix
  if (token !== API_KEY) {
    return NextResponse.json(
      { success: false, error: "Invalid API key" },
      { status: 401 }
    );
  }

  return null; // Auth passed
}
