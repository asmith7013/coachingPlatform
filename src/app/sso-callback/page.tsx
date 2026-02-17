"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

/**
 * SSO Callback page - handles OAuth redirect from Google
 * Clerk processes the OAuth response and completes sign-in
 */
export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Completing sign in...</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
