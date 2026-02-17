import React from "react";
import { Button } from "@/components/core/Button";
import { cn } from "@ui/utils/formatters";

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  className?: string;
}

/**
 * Reusable Confirmation Dialog Component
 *
 * Provides a consistent confirmation dialog for destructive or important actions.
 * Uses the established design system and Button component patterns.
 */
export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  isLoading = false,
  className,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getConfirmButtonIntent = () => {
    switch (variant) {
      case "danger":
        return "danger" as const;
      case "warning":
        return "secondary" as const;
      default:
        return "primary" as const;
    }
  };

  return (
    <div
      className="fixed inset-x-0 top-0 flex justify-center pt-4 z-50"
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          "bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl",
          className,
        )}
      >
        <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end space-x-3">
          <Button
            intent="secondary"
            appearance="outline"
            padding="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            intent={getConfirmButtonIntent()}
            appearance="solid"
            padding="sm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
