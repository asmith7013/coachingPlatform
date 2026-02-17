// Internal JSON structure for Things 3 checklist
export interface ThingsChecklistItem {
  title: string;
  notes?: string;
  children?: ThingsChecklistItem[];
  type?: "heading" | "task"; // default is 'task'
}

export interface ThingsChecklist {
  title: string;
  notes?: string;
  when?: string;
  items: ThingsChecklistItem[];
}

// Define the structure expected by Things 3
export interface ThingsHeading {
  type: "heading";
  attributes: {
    title: string;
  };
}

export interface ThingsTodo {
  type: "to-do";
  attributes: {
    title: string;
    notes: string;
  };
}

export interface ThingsProject {
  type: "project";
  attributes: {
    title: string;
    notes: string;
    when: string;
  };
  data: Array<ThingsHeading | ThingsTodo>;
}

export interface ThingsData {
  items: ThingsProject[];
}

// Notification type
export interface Notification {
  title: string;
  message: string;
  type: "success" | "error" | "info";
}
