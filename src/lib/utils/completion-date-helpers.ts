/**
 * Shared utilities for working with completion dates
 * Used across the Podsie progress tracking system to determine when work was completed
 */

/**
 * Completion timing categories
 */
export type CompletionTiming = "today" | "yesterday" | "prior" | "incomplete";

/**
 * Result of analyzing a completion date
 */
export interface CompletionDateInfo {
  timing: CompletionTiming;
  formattedDate: string;
  formattedTime: string;
  dateLabel: string;
}

/**
 * Get today's date at midnight in local timezone
 */
function getTodayAtMidnight(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Get yesterday's date at midnight in local timezone
 */
function getYesterdayAtMidnight(): Date {
  const today = getTodayAtMidnight();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}

/**
 * Convert a date to midnight in local timezone
 */
function getDateAtMidnight(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

/**
 * Format time in 12-hour format (e.g., "1:45pm")
 */
function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutesStr}${ampm}`;
}

/**
 * Format date in M/D format (e.g., "4/5")
 */
function formatDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

/**
 * Determine if a completion happened today
 * @param completedAt ISO format date string or undefined
 * @returns true if completion was today, false otherwise
 */
export function isCompletedToday(completedAt?: string): boolean {
  if (!completedAt) return false;

  const completedDate = new Date(completedAt);
  const today = getTodayAtMidnight();
  const completedDateOnly = getDateAtMidnight(completedDate);

  return completedDateOnly.getTime() === today.getTime();
}

/**
 * Determine if a completion happened yesterday
 * @param completedAt ISO format date string or undefined
 * @returns true if completion was yesterday, false otherwise
 */
export function isCompletedYesterday(completedAt?: string): boolean {
  if (!completedAt) return false;

  const completedDate = new Date(completedAt);
  const yesterday = getYesterdayAtMidnight();
  const completedDateOnly = getDateAtMidnight(completedDate);

  return completedDateOnly.getTime() === yesterday.getTime();
}

/**
 * Determine if a completion happened before yesterday
 * @param completedAt ISO format date string or undefined
 * @returns true if completion was before yesterday, false otherwise
 */
export function isCompletedPrior(completedAt?: string): boolean {
  if (!completedAt) return false;

  const completedDate = new Date(completedAt);
  const yesterday = getYesterdayAtMidnight();
  const completedDateOnly = getDateAtMidnight(completedDate);

  return completedDateOnly.getTime() < yesterday.getTime();
}

/**
 * Get the completion timing category for a date
 * @param completedAt ISO format date string or undefined
 * @returns CompletionTiming category
 */
export function getCompletionTiming(completedAt?: string): CompletionTiming {
  if (!completedAt) return "incomplete";
  if (isCompletedToday(completedAt)) return "today";
  if (isCompletedYesterday(completedAt)) return "yesterday";
  return "prior";
}

/**
 * Get full completion date information including timing, formatted strings, etc.
 * @param completedAt ISO format date string or undefined
 * @returns CompletionDateInfo object with all date details
 */
export function getCompletionDateInfo(completedAt?: string): CompletionDateInfo {
  if (!completedAt) {
    return {
      timing: "incomplete",
      formattedDate: "",
      formattedTime: "",
      dateLabel: "",
    };
  }

  const completedDate = new Date(completedAt);
  const timing = getCompletionTiming(completedAt);
  const timeStr = formatTime(completedDate);

  switch (timing) {
    case "today":
      return {
        timing: "today",
        formattedDate: `${timeStr}, today`,
        formattedTime: timeStr,
        dateLabel: "today",
      };

    case "yesterday":
      return {
        timing: "yesterday",
        formattedDate: `${timeStr}, yesterday`,
        formattedTime: timeStr,
        dateLabel: "yesterday",
      };

    case "prior":
      const dateStr = formatDate(completedDate);
      return {
        timing: "prior",
        formattedDate: `${timeStr}, ${dateStr}`,
        formattedTime: timeStr,
        dateLabel: dateStr,
      };

    default:
      return {
        timing: "incomplete",
        formattedDate: "",
        formattedTime: "",
        dateLabel: "",
      };
  }
}

/**
 * Calculate today's progress percentage across multiple students
 * @param students Array of student progress data
 * @param getQuestions Function to extract questions from a student record
 * @returns Percentage of total possible questions completed today (0-100)
 */
export function calculateTodayProgress<T>(
  students: T[],
  getQuestions: (student: T) => Array<{ completed: boolean; completedAt?: string }>,
  getTotalQuestions: (student: T) => number
): number {
  if (students.length === 0) return 0;

  let totalQuestionsCompletedToday = 0;
  let totalPossibleQuestions = 0;

  students.forEach(student => {
    const totalQuestions = getTotalQuestions(student);
    if (totalQuestions > 0) {
      totalPossibleQuestions += totalQuestions;
      const questions = getQuestions(student);
      const questionsCompletedToday = questions.filter(q =>
        q.completed && isCompletedToday(q.completedAt)
      ).length;
      totalQuestionsCompletedToday += questionsCompletedToday;
    }
  });

  return totalPossibleQuestions > 0
    ? Math.round((totalQuestionsCompletedToday / totalPossibleQuestions) * 100)
    : 0;
}

/**
 * Calculate today's completion rate for a binary completion field (e.g., Zearn)
 * @param items Array of items
 * @param isCompleted Function to check if item is completed
 * @param getCompletedAt Function to get completion date
 * @returns Percentage of items completed today (0-100)
 */
export function calculateTodayCompletionRate<T>(
  items: T[],
  isCompleted: (item: T) => boolean,
  getCompletedAt: (item: T) => string | undefined
): number {
  if (items.length === 0) return 0;

  const completedToday = items.filter(item =>
    isCompleted(item) && isCompletedToday(getCompletedAt(item))
  ).length;

  return Math.round((completedToday / items.length) * 100);
}
