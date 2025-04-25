export type Visit = {
  id: string;
  date: string;
  sessionName: string;
  school: string;
  coach: string;
  cpm: string;
  type: string;
  status: string;
  delivery: string;
};

export type CycleInfo = {
  name: string;
  label: string;
};

export type CalendarDay = {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  formattedDate: string;
};

export type CalendarViewProps = {
  visits?: Visit[];
  cycles?: Record<string, { date: string; label: string }[]>;
}; 