import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon as CheckCircleOutlineIcon, CheckIcon } from "@heroicons/react/24/outline";
import { getCompletionDateInfo } from "@/lib/utils/completion-date-helpers";

/**
 * Helper function to determine the completion style based on completion date
 * Returns the appropriate styling info and formatted date string
 *
 * @deprecated Use getCompletionDateInfo from completion-date-helpers.ts instead
 */
function getCompletionStyle(completedAt?: string): {
  iconStyle: "today" | "yesterday" | "prior" | "default";
  formattedDate: string;
  dateLabel: string;
} {
  const info = getCompletionDateInfo(completedAt);

  return {
    iconStyle: info.timing === "incomplete" ? "default" : info.timing,
    formattedDate: info.formattedDate,
    dateLabel: info.dateLabel,
  };
}

interface CompletionCheckmarkProps {
  completed: boolean;
  completedAt?: string;
  title?: string;
  color?: "green" | "purple" | "blue";
  size?: "small" | "medium" | "large";
}

/**
 * Reusable component for rendering completion checkmarks with different styles
 *
 * Features:
 * - Completed today: Fully filled circle with checkmark
 * - Completed yesterday: Outline circle with checkmark
 * - Completed earlier: Just a checkmark (no circle)
 * - Not completed: Dash (—)
 * - Customizable color: green (default), purple, blue
 * - Customizable size: small, medium (default), large
 * - Tooltip on hover showing completion date
 */
export function CompletionCheckmark({
  completed,
  completedAt,
  title,
  color = "green",
  size = "medium",
}: CompletionCheckmarkProps) {
  // If not completed, show a dash
  if (!completed) {
    return (
      <span className="text-gray-400 text-xs" title={title}>
        —
      </span>
    );
  }

  // Determine completion style (today vs earlier)
  const completionInfo = getCompletionStyle(completedAt);

  // Size classes
  const sizeClasses = {
    small: "w-5 h-5",
    medium: "w-6 h-6",
    large: "w-7 h-7",
  };

  // Color classes for filled icon
  const filledColorClasses = {
    green: "text-green-700",
    purple: "text-purple-600",
    blue: "text-blue-600",
  };

  // Color classes for outline icon
  const outlineColorClasses = {
    green: "text-green-700",
    purple: "text-purple-600",
    blue: "text-blue-600",
  };

  const sizeClass = sizeClasses[size];

  // Determine tooltip text
  const tooltipText = title || (
    completionInfo.formattedDate
      ? `Completed: ${completionInfo.formattedDate}`
      : "Completed"
  );

  // Render filled checkmark for today's completions
  if (completionInfo.iconStyle === "today") {
    return (
      <div className="group relative inline-block">
        <CheckCircleIcon className={`${sizeClass} ${filledColorClasses[color]} mx-auto`} />
        <span className="invisible group-hover:visible absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap">
          {tooltipText}
        </span>
      </div>
    );
  }

  // Render outline checkmark for yesterday's completions
  if (completionInfo.iconStyle === "yesterday") {
    return (
      <div className="group relative inline-block">
        <CheckCircleOutlineIcon className={`${sizeClass} ${outlineColorClasses[color]} mx-auto`} />
        <span className="invisible group-hover:visible absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap">
          {tooltipText}
        </span>
      </div>
    );
  }

  // Render plain checkmark for earlier completions (prior days)
  return (
    <div className="group relative inline-block">
      <CheckIcon className={`${sizeClass} ${outlineColorClasses[color]} mx-auto`} />
      <span className="invisible group-hover:visible absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap">
        {tooltipText}
      </span>
    </div>
  );
}

/**
 * Simple checkmark component without date-based styling
 * Always shows filled or outline based on completed prop
 */
export function SimpleCheckmark({
  completed,
  title,
  color = "green",
  size = "medium",
}: {
  completed: boolean;
  title?: string;
  color?: "green" | "purple" | "blue";
  size?: "small" | "medium" | "large";
}) {
  // Size classes
  const sizeClasses = {
    small: "w-5 h-5",
    medium: "w-6 h-6",
    large: "w-7 h-7",
  };

  // Color classes for filled icon
  const filledColorClasses = {
    green: "text-green-600",
    purple: "text-purple-600",
    blue: "text-blue-600",
  };

  // Color classes for outline icon (not completed)
  const outlineColorClasses = {
    green: "text-gray-300",
    purple: "text-gray-300",
    blue: "text-gray-300",
  };

  const sizeClass = sizeClasses[size];

  if (!completed) {
    return (
      <div className="group relative inline-block">
        <CheckCircleOutlineIcon className={`${sizeClass} ${outlineColorClasses[color]} mx-auto`} />
        {title && (
          <span className="invisible group-hover:visible absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap">
            {title}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="group relative inline-block">
      <CheckCircleIcon className={`${sizeClass} ${filledColorClasses[color]} mx-auto`} />
      {title && (
        <span className="invisible group-hover:visible absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap">
          {title}
        </span>
      )}
    </div>
  );
}
