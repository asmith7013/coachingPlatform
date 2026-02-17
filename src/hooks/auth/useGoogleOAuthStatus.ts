import { useQuery } from "@tanstack/react-query";
import { useAuth, useClerk } from "@clerk/nextjs";

interface OAuthStatus {
  valid: boolean;
  error?: string;
  message?: string;
  needsReauth?: boolean;
  scopes?: string[];
  hasDriveScope?: boolean;
}

/**
 * Hook to check Google OAuth token status
 * Use this before operations that require Google Drive access
 */
export function useGoogleOAuthStatus(options?: { enabled?: boolean }) {
  const { isSignedIn } = useAuth();

  const query = useQuery<OAuthStatus>({
    queryKey: ["google-oauth-status"],
    queryFn: async () => {
      const response = await fetch("/api/auth/check-google-oauth");
      return response.json();
    },
    enabled: isSignedIn && options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes - don't check too frequently
    retry: false, // Don't retry on failure
  });

  return {
    ...query,
    isLoaded: !query.isLoading && !query.isPending,
    isValid: query.data?.valid ?? false,
    needsReauth: query.data?.needsReauth ?? false,
    hasDriveScope: query.data?.hasDriveScope ?? false,
    errorMessage: query.data?.message,
  };
}

/**
 * Hook to trigger Google re-authentication
 * Opens Clerk's OAuth flow to reconnect Google
 */
export function useGoogleReauth() {
  const clerk = useClerk();

  const reauthenticate = async () => {
    try {
      // Open the OAuth connect flow for Google
      // This forces a new consent screen with fresh tokens
      await clerk.openGoogleOneTap?.();
      // If that's not available, fall back to sign-in
    } catch {
      // Redirect to sign-in with Google as a fallback
      window.location.href =
        "/sign-in?redirect_url=" + encodeURIComponent(window.location.pathname);
    }
  };

  return { reauthenticate };
}
