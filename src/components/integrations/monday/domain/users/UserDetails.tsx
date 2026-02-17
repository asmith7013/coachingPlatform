"use client";

import { useState, useEffect, useRef } from "react";
import { MondayUser } from "@lib/integrations/monday/types/api";
import { Badge } from "@components/core/feedback/Badge";
import { Button } from "@components/core/Button";
import { Spinner } from "@components/core/feedback/Spinner";
import { Dialog } from "@components/composed/dialogs/Dialog";
import { useStaffExistence } from "@hooks/integrations/monday/useStaffExistence";
import { CreateTeachingLabStaffForm } from "./CreateTeachingLabStaffForm";
import Image from "next/image";

// Extended MondayUser interface for additional properties
interface ExtendedMondayUser extends MondayUser {
  photo_thumb?: string;
  title?: string;
}

export interface UserDetailsProps {
  user: ExtendedMondayUser;
  className?: string;
  onStaffCreated?: () => void;
}

export function UserDetails({
  user,
  className,
  onStaffCreated,
}: UserDetailsProps) {
  const { exists, checking, error, checkExistence } = useStaffExistence();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use a ref to track if we've already checked for this user
  const hasCheckedRef = useRef<boolean>(false);

  // Check if staff with this email exists - but only once per user
  useEffect(() => {
    if (user?.email && !hasCheckedRef.current) {
      hasCheckedRef.current = true;
      checkExistence(user.email).catch((err) => {
        console.error("Error checking staff existence:", err);
      });
    }
  }, [user?.email, checkExistence]);

  const handleCreateClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleStaffCreated = () => {
    setIsModalOpen(false);
    hasCheckedRef.current = false; // Reset the check so we'll check again
    checkExistence(user.email); // Re-check existence
    if (onStaffCreated) {
      onStaffCreated();
    }
  };

  return (
    <div className={`border rounded-md p-4 ${className || ""}`}>
      <div className="flex items-center gap-4">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {user.photo_thumb ? (
            <Image
              src={user.photo_thumb}
              alt={user.name || "User"}
              unoptimized
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500 text-lg">
                {user.name?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h3 className="font-medium text-lg">{user.name || "Unnamed User"}</h3>
          <p className="text-gray-600">{user.email || "No email available"}</p>
          {user.title && <p className="text-gray-500 text-sm">{user.title}</p>}
        </div>

        {/* Monday ID and Staff Status */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <Badge intent="secondary" appearance="outline" size="xs">
            ID: {user.id}
          </Badge>

          {checking ? (
            <div className="flex items-center">
              <Spinner size="xs" className="mr-1" />
              <span className="text-xs">Checking...</span>
            </div>
          ) : error ? (
            <Badge intent="danger" size="xs">
              Error checking
            </Badge>
          ) : exists === true ? (
            <Badge intent="success" appearance="outline" size="xs">
              Staff Exists
            </Badge>
          ) : exists === false ? (
            <div className="flex items-center gap-2">
              <Badge intent="warning" size="xs">
                Staff Not Found
              </Badge>
              <Button
                intent="primary"
                padding="sm"
                textSize="sm"
                onClick={handleCreateClick}
                className="text-xs py-1 px-2"
              >
                Create
              </Button>
            </div>
          ) : (
            <div>Hello</div>
          )}
        </div>
      </div>

      {/* Staff Creation Modal */}
      {isModalOpen && (
        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          title="Create Teaching Lab Staff"
        >
          <CreateTeachingLabStaffForm
            user={user}
            onSuccess={handleStaffCreated}
            onCancel={handleCloseModal}
          />
        </Dialog>
      )}
    </div>
  );
}
