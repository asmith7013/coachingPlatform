import { tv } from "tailwind-variants";

/**
 * Unified event styling system for schedule and calendar components
 * Eliminates duplicate color mapping and styling patterns
 */

export type EventColor =
  | "blue"
  | "green"
  | "purple"
  | "yellow"
  | "pink"
  | "gray";

/**
 * Standardized color mapping for consistent event display
 * Used across ScheduleEventCell, EventItem, AssignedTeacherCard, etc.
 */
export const EVENT_COLOR_MAP = {
  blue: {
    container: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    text: "text-blue-700",
    accent: "text-blue-500 group-hover:text-blue-700",
    border: "border-blue-200",
    selected: "ring-blue-500 bg-blue-100 border-blue-300",
  },
  green: {
    container: "bg-green-50 hover:bg-green-100 border-green-200",
    text: "text-green-700",
    accent: "text-green-500 group-hover:text-green-700",
    border: "border-green-200",
    selected: "ring-green-500 bg-green-100 border-green-300",
  },
  purple: {
    container: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    text: "text-purple-700",
    accent: "text-purple-500 group-hover:text-purple-700",
    border: "border-purple-200",
    selected: "ring-purple-500 bg-purple-100 border-purple-300",
  },
  yellow: {
    container: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200",
    text: "text-yellow-700",
    accent: "text-yellow-500 group-hover:text-yellow-700",
    border: "border-yellow-200",
    selected: "ring-yellow-500 bg-yellow-100 border-yellow-300",
  },
  pink: {
    container: "bg-pink-50 hover:bg-pink-100 border-pink-200",
    text: "text-pink-700",
    accent: "text-pink-500 group-hover:text-pink-700",
    border: "border-pink-200",
    selected: "ring-pink-500 bg-pink-100 border-pink-300",
  },
  gray: {
    container: "bg-gray-100 hover:bg-gray-200 border-gray-200",
    text: "text-gray-700",
    accent: "text-gray-500 group-hover:text-gray-700",
    border: "border-gray-200",
    selected: "ring-gray-500 bg-gray-100 border-gray-300",
  },
} as const;

/**
 * Get event color classes for any component
 * Consistent styling across all schedule and calendar components
 */
export function getEventColorClasses(
  color: EventColor,
): (typeof EVENT_COLOR_MAP)[EventColor] {
  return EVENT_COLOR_MAP[color] || EVENT_COLOR_MAP.gray;
}

/**
 * Get basic event container classes
 * For simple event display without hover states
 */
export function getEventContainerClasses(
  color: EventColor,
  selected?: boolean,
): string {
  const colorClasses = getEventColorClasses(color);
  const baseClasses = `${colorClasses.container} ${colorClasses.border}`;
  return selected
    ? `${baseClasses} ring-2 ${colorClasses.selected}`
    : baseClasses;
}

/**
 * Get event text classes
 * For event titles and labels
 */
export function getEventTextClasses(color: EventColor): string {
  return getEventColorClasses(color).text;
}

/**
 * Get event accent classes
 * For secondary text like times, details
 */
export function getEventAccentClasses(color: EventColor): string {
  return getEventColorClasses(color).accent;
}

/**
 * Unified event item variant system using Tailwind Variants
 * Can be used across different event components
 */
export const eventItem = tv({
  slots: {
    container:
      "group absolute inset-1 flex flex-col overflow-y-auto rounded-lg p-2 text-xs/5 border transition-all duration-200",
    title: "order-1 font-semibold",
    subtitle: "group-hover:text-opacity-80 text-xs",
    detail: "text-xs opacity-75",
  },
  variants: {
    color: {
      blue: {
        container: EVENT_COLOR_MAP.blue.container,
        title: EVENT_COLOR_MAP.blue.text,
        subtitle: EVENT_COLOR_MAP.blue.accent,
        detail: EVENT_COLOR_MAP.blue.accent,
      },
      green: {
        container: EVENT_COLOR_MAP.green.container,
        title: EVENT_COLOR_MAP.green.text,
        subtitle: EVENT_COLOR_MAP.green.accent,
        detail: EVENT_COLOR_MAP.green.accent,
      },
      purple: {
        container: EVENT_COLOR_MAP.purple.container,
        title: EVENT_COLOR_MAP.purple.text,
        subtitle: EVENT_COLOR_MAP.purple.accent,
        detail: EVENT_COLOR_MAP.purple.accent,
      },
      yellow: {
        container: EVENT_COLOR_MAP.yellow.container,
        title: EVENT_COLOR_MAP.yellow.text,
        subtitle: EVENT_COLOR_MAP.yellow.accent,
        detail: EVENT_COLOR_MAP.yellow.accent,
      },
      pink: {
        container: EVENT_COLOR_MAP.pink.container,
        title: EVENT_COLOR_MAP.pink.text,
        subtitle: EVENT_COLOR_MAP.pink.accent,
        detail: EVENT_COLOR_MAP.pink.accent,
      },
      gray: {
        container: EVENT_COLOR_MAP.gray.container,
        title: EVENT_COLOR_MAP.gray.text,
        subtitle: EVENT_COLOR_MAP.gray.accent,
        detail: EVENT_COLOR_MAP.gray.accent,
      },
    },
    selected: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      color: "blue",
      selected: true,
      class: {
        container: `ring-2 ${EVENT_COLOR_MAP.blue.selected} shadow-md`,
      },
    },
    {
      color: "green",
      selected: true,
      class: {
        container: `ring-2 ${EVENT_COLOR_MAP.green.selected} shadow-md`,
      },
    },
    {
      color: "purple",
      selected: true,
      class: {
        container: `ring-2 ${EVENT_COLOR_MAP.purple.selected} shadow-md`,
      },
    },
    {
      color: "yellow",
      selected: true,
      class: {
        container: `ring-2 ${EVENT_COLOR_MAP.yellow.selected} shadow-md`,
      },
    },
    {
      color: "pink",
      selected: true,
      class: {
        container: `ring-2 ${EVENT_COLOR_MAP.pink.selected} shadow-md`,
      },
    },
    {
      color: "gray",
      selected: true,
      class: {
        container: `ring-2 ${EVENT_COLOR_MAP.gray.selected} shadow-md`,
      },
    },
  ],
  defaultVariants: {
    color: "blue",
    selected: false,
  },
});

/**
 * Position utilities for schedule events
 * Standardizes event positioning across components
 */
export function getEventPosition(
  position: "full" | "start" | "middle" | "end",
  duration?: number,
): React.CSSProperties {
  switch (position) {
    case "full":
      return { top: "0", bottom: "0", left: "0", right: "0" };
    case "start":
      return {
        top: "0",
        height: duration === 0.5 ? "50%" : "100%",
        left: "0",
        right: "0",
      };
    case "middle":
      return { top: "50%", bottom: "0", left: "0", right: "0" };
    case "end":
      return { bottom: "0", height: "50%", left: "0", right: "0" };
    default:
      return { top: "0", bottom: "0", left: "0", right: "0" };
  }
}

/**
 * Duration display utilities
 * Consistent duration formatting across components
 */
export function formatEventDuration(totalDuration: number): string {
  if (totalDuration === 0.5) return "Half";
  if (totalDuration === 1) return "Full";
  return `${totalDuration}p`;
}

/**
 * Time formatting utilities
 * Consistent time display across schedule components
 */
export function formatEventTime(timeString: string): string {
  const date = new Date(`2000-01-01T${timeString}`);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
