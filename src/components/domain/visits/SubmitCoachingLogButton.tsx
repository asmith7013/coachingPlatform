"use client";

import React from "react";
import { Button } from "@/components/core/Button";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

interface SubmitCoachingLogButtonProps {
  visitId: string;
  intent?: "primary" | "secondary" | "danger" | "success";
  appearance?: "solid" | "alt" | "outline";
  textSize?: "xs" | "sm" | "base" | "lg" | "xl";
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function SubmitCoachingLogButton({
  visitId,
  intent = "primary",
  appearance = "solid",
  textSize = "sm",
  disabled = false,
  className,
  children,
}: SubmitCoachingLogButtonProps) {
  const handleSubmitCoachingLog = () => {
    if (!visitId) {
      console.warn("SubmitCoachingLogButton: visitId is required");
      return;
    }

    // Create URL with visitId parameter
    const coachingLogUrl = `/dashboard/coaching-log-automation?visitId=${encodeURIComponent(visitId)}`;

    // Open in new tab
    window.open(coachingLogUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      intent={intent}
      appearance={appearance}
      textSize={textSize}
      onClick={handleSubmitCoachingLog}
      disabled={disabled}
      className={className}
      icon={<PencilSquareIcon className="h-4 w-4" />}
    >
      {children || "Submit Coaching Log"}
    </Button>
  );
}
