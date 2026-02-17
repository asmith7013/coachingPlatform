"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MondayUserFinder } from "@/components/integrations/monday/domain/users/UserFinder";
import { Button } from "@/components/core/Button";
import { Alert } from "@/components/core/feedback/Alert";
import { Heading } from "@/components/core/typography/Heading";
import { Text } from "@/components/core/typography/Text";

interface MondayUser {
  id: string;
  name: string;
  email: string;
  title?: string;
  photo_thumb?: string;
  teams?: { id: string; name: string }[];
  is_verified?: boolean;
}

export default function MondayStaffIntegrationPage() {
  const router = useRouter();
  const [linkResult, setLinkResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleUserSelect = (user: MondayUser) => {
    // Here you would typically link this user to a staff member
    // For demo purposes, just show a success message
    setLinkResult({
      success: true,
      message: `User ${user.name} (${user.email}) retrieved successfully. You can now link this user to a staff member.`,
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <header className="mb-6">
        <Heading level="h1" className="mb-2">
          Monday.com Staff Integration
        </Heading>
        <Text className="text-gray-600">
          Retrieve user information from Monday.com by ID.
        </Text>
      </header>

      <MondayUserFinder onUserSelect={handleUserSelect} />

      {linkResult && (
        <Alert intent={linkResult.success ? "success" : "error"}>
          <Alert.Title>{linkResult.success ? "Success" : "Error"}</Alert.Title>
          <Alert.Description>{linkResult.message}</Alert.Description>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button
          intent="secondary"
          onClick={() => router.push("/integrations/monday")}
        >
          Back to Monday.com Dashboard
        </Button>
      </div>
    </div>
  );
}
