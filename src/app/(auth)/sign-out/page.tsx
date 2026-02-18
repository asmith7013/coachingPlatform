"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { Card } from "@/components/composed/cards/Card";

export default function SignOutPage() {
  const { signOut } = useClerk();

  useEffect(() => {
    // Automatically sign out when page loads
    signOut({ redirectUrl: "/sign-in" });
  }, [signOut]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Signing out...</h1>
          <p className="mt-2 text-gray-600">
            Please wait while we sign you out
          </p>
        </div>
      </Card>
    </div>
  );
}
