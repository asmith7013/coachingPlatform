import { NextResponse } from "next/server";
import { clerkClient, auth } from "@clerk/nextjs/server";

/**
 * Check if the user's Google OAuth token is valid and can be refreshed
 * Returns the status of the OAuth connection
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({
        valid: false,
        error: "not_authenticated",
        message: "User not authenticated",
      });
    }

    const clerk = await clerkClient();

    try {
      // Try to get the OAuth token - this will attempt a refresh if needed
      const tokens = await clerk.users.getUserOauthAccessToken(
        userId,
        "google",
      );

      if (!tokens || tokens.data.length === 0) {
        return NextResponse.json({
          valid: false,
          error: "no_token",
          message:
            "No Google OAuth connection found. Please sign in with Google.",
        });
      }

      const token = tokens.data[0];

      if (!token.token) {
        return NextResponse.json({
          valid: false,
          error: "empty_token",
          message:
            "Google OAuth token is empty. Please reconnect your Google account.",
        });
      }

      // Token is valid
      return NextResponse.json({
        valid: true,
        scopes: token.scopes || [],
        // Check if drive scope is present
        hasDriveScope:
          token.scopes?.some(
            (s) => s.includes("drive") || s.includes("Drive"),
          ) || false,
      });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clerkError = error as any;

      // Token refresh failed - user needs to re-authenticate
      if (clerkError?.clerkError && clerkError?.status === 400) {
        const errorCode = clerkError?.errors?.[0]?.code || "unknown";
        const errorMessage =
          clerkError?.errors?.[0]?.message || "Token refresh failed";

        return NextResponse.json({
          valid: false,
          error: errorCode,
          message: errorMessage,
          needsReauth: true,
        });
      }

      throw error;
    }
  } catch (error) {
    console.error("[check-google-oauth] Error:", error);
    return NextResponse.json(
      {
        valid: false,
        error: "server_error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to check OAuth status",
      },
      { status: 500 },
    );
  }
}
