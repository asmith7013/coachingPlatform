"use client";

import { useState } from "react";
import { Button } from "@/components/core/Button";
import { Input } from "@/components/core/fields/Input";
import { Spinner } from "@/components/core/feedback/Spinner";
import { Alert } from "@/components/core/feedback/Alert";
import { MondayUser } from "@lib/integrations/monday/types/api";

export interface UserFormProps {
  onUserFound?: (user: MondayUser) => void;
  className?: string;
}

export function UserForm({ onUserFound, className }: UserFormProps) {
  const [email, setEmail] = useState("alex.smith@teachinglab.org");
  const [searchStatus, setSearchStatus] = useState<{
    status: "idle" | "loading" | "error" | "not-found";
    message?: string;
  }>({ status: "idle" });

  const handleSearch = async () => {
    if (!email) return;

    setSearchStatus({ status: "loading" });

    try {
      // Use the API endpoint instead of the server action
      const response = await fetch(
        `/api/integrations/monday/user?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
        },
      );

      const result = await response.json();

      if (response.ok && result.success && result.data) {
        setSearchStatus({ status: "idle" });
        onUserFound?.(result.data);
      } else {
        setSearchStatus({
          status: "not-found",
          message: result.error || `No user found with email ${email}`,
        });
      }
    } catch (err) {
      console.error("Search error:", err);
      setSearchStatus({
        status: "error",
        message:
          err instanceof Error ? err.message : "An unknown error occurred",
      });
    }
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Search by email"
            type="email"
            className="flex-1"
          />
          <Button
            intent="primary"
            onClick={handleSearch}
            disabled={!email || searchStatus.status === "loading"}
          >
            {searchStatus.status === "loading" ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </Button>
        </div>

        {searchStatus.status === "error" && (
          <Alert intent="error">
            <Alert.Title>Error</Alert.Title>
            <Alert.Description>{searchStatus.message}</Alert.Description>
          </Alert>
        )}

        {searchStatus.status === "not-found" && (
          <Alert intent="warning">
            <Alert.Title>Not Found</Alert.Title>
            <Alert.Description>{searchStatus.message}</Alert.Description>
          </Alert>
        )}
      </div>
    </div>
  );
}
