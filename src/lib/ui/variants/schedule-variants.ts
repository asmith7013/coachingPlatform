import { tv } from 'tailwind-variants';

/**
 * Schedule Event Variants
 * 
 * Provides consistent styling for different event types in the schedule system.
 * Uses semantic color tokens for maintainability.
 */
export const scheduleEventVariant = tv({
  base: "rounded transition-colors text-center font-medium",
  variants: {
    eventType: {
      observation: "bg-blue-500 text-white border-blue-700",
      debrief: "bg-purple-500 text-white border-purple-600",
      coPlanning: "bg-purple-500 text-white border-purple-600",
      plc: "bg-green-500 text-white border-green-600"
    },
    size: {
      sm: "px-2 py-1 text-xs",
      md: "px-3 py-2 text-sm",
      lg: "px-4 py-3 text-base"
    }
  },
  defaultVariants: {
    eventType: "observation",
    size: "md"
  }
});

/**
 * Schedule Portion Variants
 * 
 * Handles styling for different schedule portions (full period, half periods).
 * Supports both display and interactive states.
 */
export const schedulePortionVariant = tv({
  base: "rounded px-2 py-1 text-xs transition-colors",
  variants: {
    portion: {
      full: "bg-blue-50 border-blue-200 text-blue-700",
      first: "bg-green-50 border-green-200 text-green-700",
      second: "bg-orange-50 border-orange-200 text-orange-700"
    },
    interactive: {
      true: "border hover:opacity-80 cursor-pointer",
      false: "border"
    },
    state: {
      default: "",
      hover: "",
      selected: "ring-2 ring-blue-400"
    }
  },
  compoundVariants: [
    {
      portion: "full",
      interactive: true,
      class: "hover:bg-blue-100 hover:border-blue-300"
    },
    {
      portion: "first", 
      interactive: true,
      class: "hover:bg-green-100 hover:border-green-300"
    },
    {
      portion: "second",
      interactive: true,
      class: "hover:bg-orange-100 hover:border-orange-300"
    }
  ],
  defaultVariants: {
    portion: "full",
    interactive: false,
    state: "default"
  }
});

/**
 * Teacher Cell Variants
 * 
 * Provides styling for teacher period cells with different activity types
 * and selection states.
 */
export const teacherCellVariant = tv({
  base: "h-16 rounded cursor-pointer transition-all border hover:opacity-80 flex items-center justify-center",
  variants: {
    activityType: {
      lunch: "bg-pink-50 text-pink-700 border-pink-200",
      prep: "bg-gray-100 text-gray-700 border-gray-200",
      regular: "bg-blue-50 text-blue-700 border-blue-200"
    },
    selected: {
      true: "",
      false: ""
    },
    size: {
      sm: "h-12 text-xs",
      md: "h-16 text-sm", 
      lg: "h-20 text-base"
    }
  },
  compoundVariants: [
    {
      activityType: "lunch",
      selected: true,
      class: "bg-pink-500 text-white border-pink-700 border-4"
    },
    {
      activityType: "prep",
      selected: true,
      class: "bg-gray-500 text-white border-gray-700 border-4"
    },
    {
      activityType: "regular",
      selected: true,
      class: "bg-blue-500 text-white border-blue-700 border-4"
    }
  ],
  defaultVariants: {
    activityType: "regular",
    selected: false,
    size: "md"
  }
});

/**
 * Planning Status Variants
 * 
 * Handles the planning status icons for observation and meeting indicators.
 * Shows planned vs unplanned states with appropriate colors.
 */
export const planningStatusVariant = tv({
  base: "w-8 h-8 rounded-full flex items-center justify-center transition-colors border-2",
  variants: {
    status: {
      planned: "",
      unplanned: "bg-white"
    },
    type: {
      observation: "",
      meeting: ""
    },
    size: {
      sm: "w-6 h-6",
      md: "w-8 h-8",
      lg: "w-10 h-10"
    }
  },
  compoundVariants: [
    {
      status: "planned",
      type: "observation",
      class: "bg-blue-500 border-blue-700 text-white"
    },
    {
      status: "planned",
      type: "meeting", 
      class: "bg-purple-500 border-purple-600 text-white"
    },
    {
      status: "unplanned",
      type: "observation",
      class: "border-blue-500 text-blue-500"
    },
    {
      status: "unplanned",
      type: "meeting",
      class: "border-purple-500 text-purple-500"
    }
  ],
  defaultVariants: {
    status: "unplanned",
    type: "observation",
    size: "md"
  }
});

/**
 * Drop Zone Variants
 * 
 * Styling for drop zones in the schedule grid where events can be placed.
 * Handles different states like active, hovering, and occupied.
 */
export const dropZoneVariant = tv({
  base: "h-16 p-1 rounded transition-colors",
  variants: {
    state: {
      empty: "border-2 border-dashed border-gray-300",
      occupied: "",
      active: "border-2 border-solid border-blue-400 bg-blue-50",
      hover: "border-2 border-solid border-blue-300 bg-blue-25"
    },
    size: {
      sm: "h-12 p-0.5",
      md: "h-16 p-1",
      lg: "h-20 p-2"
    }
  },
  defaultVariants: {
    state: "empty",
    size: "md"
  }
});

/**
 * Schedule Grid Variants
 * 
 * Provides layout variants for the overall schedule grid structure.
 */
export const scheduleGridVariant = tv({
  base: "bg-white rounded-lg shadow-sm border border-gray-200",
  variants: {
    size: {
      compact: "text-xs",
      normal: "text-sm",
      large: "text-base"
    },
    overflow: {
      visible: "overflow-visible",
      hidden: "overflow-hidden",
      scroll: "overflow-auto"
    }
  },
  defaultVariants: {
    size: "normal",
    overflow: "visible"
  }
}); 