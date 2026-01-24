"use client";

import { ReactNode } from "react";
import { WizardStickyFooter, type FooterTheme } from "./WizardStickyFooter";
import { AiEditInput } from "./AiEditInput";
import { LoadingSpinner } from "./LoadingSpinner";
import { formatElapsedTimeShort } from "../../lib/utils";
import type { EditImage } from "../../lib/types";

/**
 * Loading state configuration for the footer.
 * Supports multiple loading states with different themes.
 */
interface LoadingState {
  /** Theme color for the loading state */
  theme: FooterTheme;
  /** Message to display while loading */
  message: string;
  /** Elapsed time in milliseconds */
  elapsed: number;
}

/**
 * AI edit input configuration.
 */
interface AiEditConfig {
  prompt: string;
  setPrompt: (value: string) => void;
  images: EditImage[];
  setImages: (images: EditImage[]) => void;
  onSubmit: () => void;
  placeholder?: string;
  submitLabel?: string;
  /** Whether the submit is disabled (beyond just empty prompt/images) */
  disabled?: boolean;
}

interface WizardEditFooterProps {
  /** Handler for the Back button */
  onBack: () => void;
  /** AI edit input configuration */
  aiEdit: AiEditConfig;
  /** Error message to display below the footer content */
  error?: string | null;
  /** Loading state - when set, shows loading UI instead of edit controls */
  loading?: LoadingState | null;
  /** Action buttons to render on the right side (e.g., Generate, Export) */
  rightActions?: ReactNode;
  /** Default theme when not loading (defaults to 'purple') */
  theme?: FooterTheme;
}

/**
 * Unified wizard footer with AI edit capabilities.
 *
 * Layout: [Back] [AiEditInput] [rightActions]
 *
 * When loading is active, shows a loading spinner with message and elapsed time.
 * When not loading, shows the edit controls and action buttons.
 *
 * Standardizes button heights at h-10 (40px) for visual consistency.
 */
export function WizardEditFooter({
  onBack,
  aiEdit,
  error,
  loading,
  rightActions,
  theme = "purple",
}: WizardEditFooterProps) {
  const isLoading = !!loading;
  const activeTheme = loading?.theme ?? theme;

  // Get theme-specific colors for loading state
  const themeColors: Record<
    FooterTheme,
    { spinner: string; text: string; time: string }
  > = {
    purple: {
      spinner: "text-purple-600",
      text: "text-purple-800",
      time: "text-purple-600",
    },
    green: {
      spinner: "text-green-600",
      text: "text-green-800",
      time: "text-green-600",
    },
    blue: {
      spinner: "text-blue-600",
      text: "text-blue-800",
      time: "text-blue-600",
    },
    amber: {
      spinner: "text-amber-600",
      text: "text-amber-800",
      time: "text-amber-600",
    },
    yellow: {
      spinner: "text-yellow-600",
      text: "text-yellow-800",
      time: "text-yellow-600",
    },
    gray: {
      spinner: "text-gray-600",
      text: "text-gray-800",
      time: "text-gray-600",
    },
  };

  const colors = themeColors[activeTheme];

  return (
    <WizardStickyFooter theme={activeTheme} isActive={isLoading}>
      {isLoading ? (
        <div className="flex items-center gap-3">
          <LoadingSpinner className={colors.spinner} />
          <span className={`text-sm ${colors.text} flex-1 truncate`}>
            {loading.message}
          </span>
          <span className={`text-sm ${colors.time} font-mono tabular-nums`}>
            {formatElapsedTimeShort(loading.elapsed)}
          </span>
        </div>
      ) : (
        <div className="flex gap-3 items-center">
          <button
            onClick={onBack}
            className="h-10 px-4 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer border border-gray-300 flex-shrink-0 flex items-center justify-center"
          >
            Back
          </button>

          <AiEditInput
            prompt={aiEdit.prompt}
            setPrompt={aiEdit.setPrompt}
            images={aiEdit.images}
            setImages={aiEdit.setImages}
            onSubmit={aiEdit.onSubmit}
            placeholder={aiEdit.placeholder}
            disabled={aiEdit.disabled}
            submitLabel={aiEdit.submitLabel}
          />

          {rightActions}
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </WizardStickyFooter>
  );
}

/**
 * Standard button styles for use in rightActions.
 * All buttons use h-10 for consistent height.
 */
export const footerButtonStyles = {
  primary:
    "h-10 px-4 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg cursor-pointer flex items-center justify-center gap-2 transition-colors flex-shrink-0",
  success:
    "h-10 px-4 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg cursor-pointer flex items-center justify-center gap-2 transition-colors flex-shrink-0",
  warning:
    "h-10 px-4 text-sm bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg cursor-pointer flex items-center justify-center gap-2 transition-colors flex-shrink-0",
  secondary:
    "h-10 px-4 text-sm bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg cursor-pointer flex items-center justify-center gap-2 transition-colors flex-shrink-0",
} as const;
