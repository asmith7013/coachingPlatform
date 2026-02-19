import type { RatingScale } from "./observation.types";

/** Full labels for Select dropdowns */
export const RATING_OPTIONS = [
  { value: "not_observed", label: "Not Observed" },
  { value: "partial", label: "Partial" },
  { value: "mostly", label: "Mostly" },
  { value: "fully", label: "Fully" },
];

/** Abbreviated labels for SegmentedControl */
export const RATING_OPTIONS_SHORT = [
  { label: "N/O", value: "not_observed" },
  { label: "Partial", value: "partial" },
  { label: "Mostly", value: "mostly" },
  { label: "Fully", value: "fully" },
];

/** Rating-to-color mapping for badges and timeline */
export const RATING_COLORS: Record<RatingScale, string> = {
  not_observed: "gray",
  partial: "orange",
  mostly: "yellow",
  fully: "green",
};

/** Observation type options for Select dropdowns */
export const OBSERVATION_TYPE_OPTIONS = [
  { value: "classroom_visit", label: "Classroom Visit" },
  { value: "debrief", label: "Debrief" },
  { value: "one_on_one", label: "One-on-One" },
  { value: "quick_update", label: "Quick Update" },
];
