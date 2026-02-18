"use client";

import React from "react";
import { EmptyState } from "@/components/core/empty/EmptyState";
import { TextSizeToken } from "@ui-tokens/types";

interface EmptyListWrapperProps<T> {
  items: T[];
  resourceName: string; // e.g., "look fors"
  children: React.ReactNode;
  title?: string;
  description?: string;
  textSize?: TextSizeToken;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}

export function EmptyListWrapper<T>({
  items,
  resourceName,
  children,
  title,
  description,
  textSize,
  icon,
  action,
}: EmptyListWrapperProps<T>) {
  if (items.length === 0) {
    return (
      <EmptyState
        title={title || `No ${resourceName} found`}
        description={
          description ||
          `Create your first ${resourceName} or upload a batch to get started.`
        }
        textSize={textSize}
        icon={icon}
        action={action}
      />
    );
  }

  return <>{children}</>;
}
