// src/components/features/schedulesComponents/styles/schedule-variants.ts

/**
 * Schedule-specific styling variants
 * These combine primitive tokens into schedule-specific component styles
 */

export const scheduleColors = {
  // Event type colors - using semantic color system
  observation: "bg-blue-500 text-white border-blue-700",
  debrief: "bg-purple-500 text-white border-purple-600",
  coPlanning: "bg-purple-500 text-white border-purple-600",
  plc: "bg-green-500 text-white border-green-600",

  // Portion colors - light backgrounds for scheduling
  fullPeriod: "bg-blue-50 text-blue-700 border-blue-200",
  firstHalf: "bg-green-50 text-green-700 border-green-200",
  secondHalf: "bg-orange-50 text-orange-700 border-orange-200",

  // Activity type colors
  lunch: "bg-pink-50 text-pink-700 border-pink-200",
  prep: "bg-gray-100 text-gray-700 border-gray-200",
  regular: "bg-blue-50 text-blue-700 border-blue-200",

  // State colors
  selected: "bg-blue-500 text-white border-blue-700",
  available: "bg-gray-50 text-gray-600 border-gray-200",

  // Interactive states
  hover: {
    fullPeriod: "hover:bg-blue-100 hover:border-blue-300",
    firstHalf: "hover:bg-green-100 hover:border-green-300",
    secondHalf: "hover:bg-orange-100 hover:border-orange-300",
    lunch: "hover:bg-pink-100 hover:border-pink-300",
    prep: "hover:bg-gray-200 hover:border-gray-300",
    regular: "hover:bg-blue-100 hover:border-blue-300",
  },

  // Planning status colors
  planning: {
    observation: {
      planned: "bg-blue-500 border-blue-700 text-white",
      unplanned: "bg-white border-blue-500 text-blue-500",
    },
    meeting: {
      planned: "bg-purple-500 border-purple-600 text-white",
      unplanned: "bg-white border-purple-500 text-purple-500",
    },
  },
};
