// Zone styling configuration for pacing progress bar

export const ZONE_ORDER = [
  "far-behind",
  "behind",
  "on-track",
  "ahead",
  "far-ahead",
] as const;

export const ZONE_LABELS: Record<string, string> = {
  "far-behind": "Far Behind",
  behind: "Behind",
  "on-track": "On Pace",
  ahead: "Ahead",
  "far-ahead": "Far Ahead",
};

export interface ZoneStyles {
  bg: string;
  border: string;
  text: string;
  badge: string;
  partBadge: string;
  studentBadge: string;
  lessonIcon: string;
  headerBg: string;
  dotColor: string;
}

const ZONE_STYLES: Record<string, ZoneStyles> = {
  "far-behind": {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-900 font-semibold",
    badge: "bg-red-100 text-red-700",
    partBadge: "bg-white text-red-900 font-semibold border border-red-900",
    studentBadge: "bg-red-600 text-white",
    lessonIcon: "text-red-500",
    headerBg: "bg-red-100",
    dotColor: "bg-red-500",
  },
  behind: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-900 font-semibold",
    badge: "bg-yellow-100 text-yellow-700",
    partBadge:
      "bg-white text-yellow-900 font-semibold border border-yellow-900",
    studentBadge: "bg-yellow-500 text-white",
    lessonIcon: "text-yellow-600",
    headerBg: "bg-yellow-100",
    dotColor: "bg-yellow-500",
  },
  "on-track": {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-900 font-semibold",
    badge: "bg-green-100 text-green-700",
    partBadge: "bg-white text-green-900 font-semibold border border-green-900",
    studentBadge: "bg-green-600 text-white",
    lessonIcon: "text-green-600",
    headerBg: "bg-green-100",
    dotColor: "bg-green-500",
  },
  ahead: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-900 font-semibold",
    badge: "bg-sky-100 text-sky-700",
    partBadge: "bg-white text-sky-900 font-semibold border border-sky-900",
    studentBadge: "bg-sky-600 text-white",
    lessonIcon: "text-sky-600",
    headerBg: "bg-sky-100",
    dotColor: "bg-sky-500",
  },
  "far-ahead": {
    bg: "bg-blue-100",
    border: "border-blue-300",
    text: "text-blue-900 font-semibold",
    badge: "bg-blue-200 text-blue-700",
    partBadge: "bg-white text-blue-900 font-semibold border border-blue-900",
    studentBadge: "bg-blue-600 text-white",
    lessonIcon: "text-blue-600",
    headerBg: "bg-blue-200",
    dotColor: "bg-blue-600",
  },
  complete: {
    bg: "bg-purple-100",
    border: "border-purple-300",
    text: "text-purple-900 font-semibold",
    badge: "bg-purple-200 text-purple-800",
    partBadge:
      "bg-white text-purple-900 font-semibold border border-purple-900",
    studentBadge: "bg-purple-600 text-white",
    lessonIcon: "text-purple-600",
    headerBg: "bg-purple-200",
    dotColor: "bg-purple-500",
  },
};

const DEFAULT_STYLES: ZoneStyles = {
  bg: "bg-gray-50",
  border: "border-gray-200",
  text: "text-gray-700",
  badge: "bg-gray-200 text-gray-600",
  partBadge: "bg-white text-gray-700 font-semibold border border-gray-700",
  studentBadge: "bg-gray-600 text-white",
  lessonIcon: "text-gray-500",
  headerBg: "bg-gray-100",
  dotColor: "bg-gray-500",
};

export function getZoneStyles(zone: string | null): ZoneStyles {
  if (!zone) return DEFAULT_STYLES;
  return ZONE_STYLES[zone] || DEFAULT_STYLES;
}
