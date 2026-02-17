export const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Check if a year is a leap year
export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

// Get days in a month accounting for leap years
export const getDaysInMonth = (year: number, month: number): number => {
  return month === 1 && isLeapYear(year) ? 29 : DAYS_IN_MONTH[month];
};

// Format date to string
export const formatDate = (date: Date, format = "yyyy-MM-dd"): string => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  if (format === "yyyy-MM-dd") {
    return `${year}-${month}-${day}`;
  } else if (format === "MMM d, yyyy") {
    return `${MONTH_NAMES[date.getMonth()].substring(0, 3)} ${date.getDate()}, ${year}`;
  } else if (format === "MMMM yyyy") {
    return `${MONTH_NAMES[date.getMonth()]} ${year}`;
  } else if (format === "d") {
    return date.getDate().toString();
  } else if (format === "MM/dd") {
    return `${month}/${day}`;
  }

  return `${year}-${month}-${day}`;
};

// Get first day of month (0 = Sunday, 1 = Monday, etc.)
export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

// Create calendar days array
export const getCalendarDays = (year: number, month: number) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  // Get last month's days that appear in the calendar
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  const days = [];

  // Add days from previous month
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = new Date(prevYear, prevMonth, day);
    days.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: isSameDay(date, new Date()),
      formattedDate: formatDate(date),
    });
  }

  // Add days from current month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({
      date,
      day: i,
      isCurrentMonth: true,
      isToday: isSameDay(date, new Date()),
      formattedDate: formatDate(date),
    });
  }

  // Add days from next month
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const daysNeeded = 42 - days.length; // Always show 6 weeks

  for (let i = 1; i <= daysNeeded; i++) {
    const date = new Date(nextYear, nextMonth, i);
    days.push({
      date,
      day: i,
      isCurrentMonth: false,
      isToday: isSameDay(date, new Date()),
      formattedDate: formatDate(date),
    });
  }

  return days;
};

// Check if two dates are the same day
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

// Check if date is in a specified month
export const isSameMonth = (date1: Date, date2: Date): boolean => {
  return (
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

// Add months to a date
export const addMonths = (date: Date, amount: number): Date => {
  const newDate = new Date(date);
  const currentMonth = newDate.getMonth();
  newDate.setMonth(currentMonth + amount);
  return newDate;
};

// Subtract months from a date
export const subMonths = (date: Date, amount: number): Date => {
  return addMonths(date, -amount);
};

// Parse an ISO date string
export const parseISO = (dateString: string): Date => {
  return new Date(dateString);
};

// Find cycle information for a given date
export const findCycleForDate = (
  date: Date,
  cycles: Record<string, { date: string; label: string }[]>,
): { cycleName: string; cycleDate: { date: string; label: string } } | null => {
  const dateStr = formatDate(date);

  for (const [cycleName, cycleDates] of Object.entries(cycles)) {
    for (const cycleDate of cycleDates) {
      if (cycleDate.date === dateStr) {
        return { cycleName, cycleDate };
      }
    }
  }

  return null;
};

// Group visits by cycle
export const groupVisitsByCycle = (
  visits: import("./types").Visit[],
  cycles: Record<string, { date: string; label: string }[]>,
) => {
  const result: Record<string, import("./types").Visit[]> = {
    "Initial Walkthrough": [],
    "Winter Cycle": [],
    "Spring Cycle": [],
    "Final Walkthrough": [],
  };

  visits.forEach((visit) => {
    const visitDate = parseISO(visit.date);
    const cycleInfo = findCycleForDate(visitDate, cycles);

    if (cycleInfo) {
      result[cycleInfo.cycleName].push(visit);
    } else if (visit.sessionName.includes("Initial Walkthrough")) {
      result["Initial Walkthrough"].push(visit);
    } else if (visit.sessionName.includes("Final Walkthrough")) {
      result["Final Walkthrough"].push(visit);
    }
  });

  return result;
};
