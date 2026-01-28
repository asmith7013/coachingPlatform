// Query hooks and keys
export * from "./queries";

// Mutation hooks
export * from "./mutations";

// Composed hook for the page
export * from "./useCalendarPageData";

// Legacy exports for backwards compatibility (can be removed after full migration)
export { CALENDAR_STORAGE_KEY } from "./useCalendarData";
export type { CalendarStorageData } from "./useCalendarData";
