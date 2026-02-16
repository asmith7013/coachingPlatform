"use client";

import { footerButtonStyles } from "../shared/WizardEditFooter";

interface SlideActionButtonsProps {
  slideCount: number;
  numMoves: number;
  isLoading: boolean;
  nextStep: () => void;
  handleGenerateSlides: (testMode: boolean, mode: "full" | "continue") => void;
}

export function SlideActionButtons({
  slideCount,
  numMoves,
  isLoading,
  nextStep,
  handleGenerateSlides,
}: SlideActionButtonsProps) {
  // All slides exist when we have main slides + printable + lesson summary
  const expectedTotal = 3 + numMoves + 2 + 2; // intro + steps + practice + printable + summary
  if (slideCount >= expectedTotal) {
    // All slides exist - show Review + Regenerate
    return (
      <>
        <button onClick={nextStep} className={footerButtonStyles.primary}>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          Review Slides ({slideCount})
        </button>
        <RegenerateButton
          isLoading={isLoading}
          onClick={() => handleGenerateSlides(false, "full")}
        />
      </>
    );
  }

  if (slideCount > 0) {
    // Partial slides - show Continue + Regenerate
    return (
      <>
        <button
          onClick={() => handleGenerateSlides(false, "continue")}
          disabled={isLoading}
          className={footerButtonStyles.success}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Continue ({slideCount}/{expectedTotal})
        </button>
        <RegenerateButton
          isLoading={isLoading}
          onClick={() => handleGenerateSlides(false, "full")}
        />
      </>
    );
  }

  // No slides - show Generate
  return (
    <button
      onClick={() => handleGenerateSlides(false, "full")}
      disabled={isLoading}
      className={footerButtonStyles.success}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Generate Slides
    </button>
  );
}

// Reusable regenerate button
function RegenerateButton({
  isLoading,
  onClick,
}: {
  isLoading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={footerButtonStyles.secondary}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      Regenerate All
    </button>
  );
}
