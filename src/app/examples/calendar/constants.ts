export const bg = {
  primary: "bg-blue-600",
  secondary: "bg-gray-200",
  light: "bg-white",
  danger: "bg-red-500",
  success: "bg-green-500",
  warning: "bg-orange-500",
  info: "bg-blue-400"
};

export const statusColors: Record<string, string> = {
  "Completed": bg.success,
  "Upcoming": bg.info,
  "Postponed/Rescheduled": bg.warning
};

export const deliveryColors: Record<string, string> = {
  "In Person": "bg-emerald-500",
  "Virtual": "bg-purple-500",
  "Hybrid": "bg-amber-500"
};

// Example visit data that would come from your database
// In your actual implementation, you'd fetch this from your API
export const visitData = [
  { 
    id: "v1", 
    date: "2025-04-07", 
    sessionName: "Session 1 - Initial Walkthrough", 
    school: "MS246", 
    coach: "AB",
    cpm: "RC",
    type: "1:1 Teacher Coaching",
    status: "Completed",
    delivery: "In Person"
  },
  { 
    id: "v2", 
    date: "2025-04-13", 
    sessionName: "Session 2", 
    school: "MS246", 
    coach: "AB",
    cpm: "RC",
    type: "1:1 Teacher Coaching",
    status: "Completed",
    delivery: "In Person"
  },
  { 
    id: "v3", 
    date: "2025-04-14", 
    sessionName: "Session 3", 
    school: "MS246", 
    coach: "AB",
    cpm: "RC",
    type: "1:1 Teacher Coaching",
    status: "Completed",
    delivery: "In Person"
  },
  { 
    id: "v4", 
    date: "2025-04-23", 
    sessionName: "Session 4", 
    school: "MS246", 
    coach: "AB",
    cpm: "RC",
    type: "1:1 Teacher Coaching",
    status: "Completed",
    delivery: "In Person"
  },
  { 
    id: "v5", 
    date: "2025-04-24", 
    sessionName: "Session 6", 
    school: "MS246", 
    coach: "AB",
    cpm: "RC",
    type: "1:1 Teacher Coaching",
    status: "Completed",
    delivery: "In Person"
  },
  { 
    id: "v6", 
    date: "2025-05-02", 
    sessionName: "Session 9", 
    school: "MS246", 
    coach: "AB",
    cpm: "RC",
    type: "1:1 Teacher Coaching",
    status: "Upcoming",
    delivery: "In Person"
  },
  { 
    id: "v7", 
    date: "2025-05-23", 
    sessionName: "Session 8", 
    school: "MS246", 
    coach: "AB",
    cpm: "RC",
    type: "1:1 Teacher Coaching",
    status: "Postponed/Rescheduled",
    delivery: "In Person"
  },
  { 
    id: "v8", 
    date: "2025-06-02", 
    sessionName: "Session 10", 
    school: "MS246", 
    coach: "AB",
    cpm: "RC",
    type: "1:1 Teacher Coaching",
    status: "Upcoming",
    delivery: "In Person"
  },
  { 
    id: "v9", 
    date: "2025-06-04", 
    sessionName: "Session 11", 
    school: "MS246", 
    coach: "AB",
    cpm: "RC",
    type: "1:1 Teacher Coaching",
    status: "Upcoming",
    delivery: "In Person"
  },
  { 
    id: "v10", 
    date: "2025-06-11", 
    sessionName: "Session 12", 
    school: "MS246", 
    coach: "AB",
    cpm: "RC",
    type: "1:1 Teacher Coaching",
    status: "Upcoming",
    delivery: "In Person"
  },
  { 
    id: "v11", 
    date: "2025-06-12", 
    sessionName: "Final Walkthrough", 
    school: "MS246", 
    coach: "AB",
    cpm: "RC",
    type: "1:1 Teacher Coaching",
    status: "Upcoming",
    delivery: "In Person"
  },
];

// Cycle data - to show the seasonal cycles
export const cycleData = {
  "Winter Cycle": [
    { date: "2025-01-13", label: "Mon 1/13" },
    { date: "2025-01-24", label: "Fri 1/24" },
    { date: "2025-02-05", label: "Wed 2/5" },
    { date: "2025-03-06", label: "Thu 3/6" },
  ],
  "Spring Cycle": [
    { date: "2025-03-24", label: "Mon 3/24" },
    { date: "2025-04-04", label: "Fri 4/4" },
    { date: "2025-05-02", label: "Fri 5/2" },
    { date: "2025-06-02", label: "Mon 6/2" },
    { date: "2025-06-04", label: "Wed 6/4" },
    { date: "2025-06-11", label: "Wed 6/11" },
    { date: "2025-06-12", label: "Thu 6/12" },
  ]
}; 