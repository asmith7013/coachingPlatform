// Entity display name mapping for notifications

const displayNames: Record<string, string> = {
  schools: "School",
  "nycps-staff": "Staff Member",
  "teaching-lab-staff": "Staff Member",
  visits: "Visit",
  cycles: "Cycle",
  "look-fors": "Look For",
  schedules: "Schedule",
  "coaching-logs": "Coaching Log",
};

export function getEntityDisplayName(entityType: string): string {
  return (
    displayNames[entityType] ||
    entityType.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );
}
