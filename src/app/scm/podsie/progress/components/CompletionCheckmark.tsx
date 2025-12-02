import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon as CheckCircleOutlineIcon } from "@heroicons/react/24/outline";

/**
 * Helper function to determine the completion style based on completion date
 * Returns the appropriate styling info and formatted date string
 */
function getCompletionStyle(completedAt?: string): {
  iconStyle: "today" | "yesterday" | "prior" | "default";
  formattedDate: string;
  dateLabel: string;
} {
  if (!completedAt) {
    return {
      iconStyle: "default",
      formattedDate: "",
      dateLabel: "",
    };
  }

  // Parse the completion date (which is in ISO format from Podsie)
  const completedDate = new Date(completedAt);

  // Get today's date at midnight in local timezone
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get yesterday's date at midnight
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Get the completion date at midnight in local timezone
  const completedDateOnly = new Date(
    completedDate.getFullYear(),
    completedDate.getMonth(),
    completedDate.getDate()
  );

  // Format time in 1:45pm format
  let hours = completedDate.getHours();
  const minutes = completedDate.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  const timeStr = `${hours}:${minutesStr}${ampm}`;

  // Determine the date label and format
  let dateLabel: string;
  let formattedDate: string;

  if (completedDateOnly.getTime() === today.getTime()) {
    dateLabel = "today";
    formattedDate = `${timeStr}, today`;
    return {
      iconStyle: "today",
      formattedDate,
      dateLabel,
    };
  } else if (completedDateOnly.getTime() === yesterday.getTime()) {
    dateLabel = "yesterday";
    formattedDate = `${timeStr}, yesterday`;
    return {
      iconStyle: "yesterday",
      formattedDate,
      dateLabel,
    };
  } else {
    // Format date in 4/5 format (M/D)
    const month = completedDate.getMonth() + 1;
    const day = completedDate.getDate();
    const dateStr = `${month}/${day}`;

    dateLabel = "prior";
    formattedDate = `${timeStr}, ${dateStr}`;
    return {
      iconStyle: "prior",
      formattedDate,
      dateLabel,
    };
  }
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
 * - Completed today: Fully filled checkmark
 * - Completed earlier: Outline checkmark
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

  // Render outline checkmark for earlier completions
  return (
    <div className="group relative inline-block">
      <CheckCircleOutlineIcon className={`${sizeClass} ${outlineColorClasses[color]} mx-auto`} />
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
