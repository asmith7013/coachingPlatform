import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@server/auth/api-key";
import { handleServerError } from "@error/handlers/server";
import { put } from "@vercel/blob";

/**
 * API endpoint for uploading student goal images.
 *
 * Headers:
 *   - Authorization: Bearer <SOLVES_COACHING_API_KEY>
 *
 * POST /api/podsie/incentives/goals/upload-image
 *   Body: FormData with "image" file field
 *   Returns: { success: true, url: string }
 */

export async function POST(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 },
      );
    }

    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const blobFileName = `student-goals/${sanitizedName}-${timestamp}`;

    const blob = await put(blobFileName, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    console.error("Error in incentives goals/upload-image POST:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 },
    );
  }
}
