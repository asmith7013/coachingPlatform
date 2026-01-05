'use client';

import { useGoogleOAuthStatus } from '@/hooks/auth/useGoogleOAuthStatus';
import { useUser, useClerk } from '@clerk/nextjs';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface GoogleOAuthRequiredProps {
  children: React.ReactNode;
  /**
   * What action requires Google OAuth (shown in error message)
   */
  action?: string;
  /**
   * If true, shows inline warning instead of blocking
   */
  warnOnly?: boolean;
}

/**
 * Wrapper component that checks Google OAuth status before rendering children
 * Shows a re-authentication prompt if the token is stale
 *
 * Usage:
 * <GoogleOAuthRequired action="export to Google Slides">
 *   <ExportButton />
 * </GoogleOAuthRequired>
 */
export function GoogleOAuthRequired({
  children,
  action = 'use this feature',
  warnOnly = false,
}: GoogleOAuthRequiredProps) {
  const { isLoaded, isValid, needsReauth, isLoading, errorMessage, refetch } = useGoogleOAuthStatus();
  const { user } = useUser();
  const clerk = useClerk();

  // Check if user signed in with Google
  const hasGoogleAccount = user?.externalAccounts?.some(
    (account) => account.provider === 'google'
  );

  const handleReauth = async () => {
    // The cleanest way to get fresh tokens is to sign out and sign back in
    // This ensures we get a new refresh token with all scopes
    const currentPath = window.location.pathname + window.location.search;
    await clerk.signOut();
    window.location.href = `/sign-in?redirect_url=${encodeURIComponent(currentPath)}`;
  };

  // Still loading - show nothing or children depending on mode
  if (!isLoaded || isLoading) {
    if (warnOnly) return <>{children}</>;
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  // User doesn't have Google connected at all
  if (!hasGoogleAccount) {
    const content = (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-800">
              Google Account Required
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              To {action}, you need to sign in with a Google account.
            </p>
            <button
              onClick={handleReauth}
              className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-md cursor-pointer transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );

    if (warnOnly) {
      return (
        <>
          {content}
          {children}
        </>
      );
    }
    return content;
  }

  // Token needs refresh / re-authentication
  if (needsReauth || !isValid) {
    const content = (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-800">
              Google Authorization Expired
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              Your Google connection needs to be refreshed to {action}.
              {errorMessage && (
                <span className="block text-xs text-amber-600 mt-1">
                  Error: {errorMessage}
                </span>
              )}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleReauth}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md cursor-pointer transition-colors"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Reconnect Google
              </button>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-md cursor-pointer transition-colors"
              >
                Check Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    if (warnOnly) {
      return (
        <>
          {content}
          {children}
        </>
      );
    }
    return content;
  }

  // All good - render children
  return <>{children}</>;
}
