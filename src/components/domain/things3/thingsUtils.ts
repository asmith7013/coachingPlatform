import { ThingsChecklist, ThingsChecklistItem, ThingsHeading, ThingsTodo, ThingsData, ThingsProject } from '@domain-types/things3-types';

/**
 * Parse plain text to JSON structure
 */
export const parseTextToJSON = (
  text: string, 
  projectTitle: string = "", 
  projectNotes: string = "", 
  projectWhen: string = "anytime"
): ThingsChecklist => {
  const checklist: ThingsChecklist = {
    title: projectTitle || "New Project",
    notes: projectNotes || "",
    when: projectWhen,
    items: []
  };
  
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  // Find sections (numbered items) and tasks (bullet points)
  let currentSection: ThingsChecklistItem | null = null;
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    const indentLevel = line.search(/\S|$/) / 2; // Assuming 2 spaces per indent level
    
    // Skip project title if it's the first line and not indented
    if (indentLevel === 0 && checklist.items.length === 0 && !projectTitle) {
      checklist.title = trimmedLine;
      return;
    }
    
    // Check if it's a section header (numbered item: "1. Something")
    const sectionMatch = trimmedLine.match(/^(\d+)\.(.+)/);
    
    // Remove any list markers (* or -)
    const cleanLine = trimmedLine.replace(/^[\*\-•\d\.]\s+/, '').trim();
    
    if (sectionMatch || (indentLevel === 0 && !trimmedLine.match(/^[\*\-•]/))) {
      // This is a main heading/section
      currentSection = {
        title: cleanLine,
        type: 'heading',
        children: []
      };
      checklist.items.push(currentSection);
    } else if (currentSection && (indentLevel > 0 || trimmedLine.match(/^[\*\-•]/))) {
      // This is a task under the current section
      if (!currentSection.children) {
        currentSection.children = [];
      }
      
      currentSection.children.push({
        title: cleanLine,
        type: 'task'
      });
    } else {
      // This is a standalone task not under any section
      checklist.items.push({
        title: cleanLine,
        type: 'task'
      });
    }
  });
  
  return checklist;
};

/**
 * Convert the JSON structure to Things 3 URL
 */
// This function transforms your structured JSON into a format compatible with Things URL scheme
// In thingsUtils.ts, update the generateThingsURL function

export function generateThingsURL(json: ThingsChecklist) {
  // Check if the input might already be in Things3 format
  // Use Record<string, unknown> instead of any
  const jsonRecord = json as unknown as Record<string, unknown>;
  
  if (isThingsDataFormat(jsonRecord)) {
    // Input is already in Things3 format, use it directly
    return generateDirectThingsURL(jsonRecord as unknown as ThingsData);
  }

  // Create the base project object
  const project: ThingsProject = {
    type: "project",
    attributes: {
      title: json.title || "Untitled Project",
      notes: json.notes || "",
      when: json.when || "anytime"
    },
    data: [] as Array<ThingsHeading | ThingsTodo>
  };
  
  // Process each item
  if (json.items && Array.isArray(json.items)) {
    json.items.forEach(item => {
      if (item.type === 'heading') {
        // Add heading
        project.data.push({
          type: "heading",
          attributes: {
            title: item.title
          }
        });
        
        // Add tasks under this heading
        if ('children' in item && item.children && Array.isArray(item.children)) {
          item.children.forEach(task => {
            project.data.push({
              type: "to-do", // Must use "to-do" with hyphen
              attributes: {
                title: task.title || "Untitled Task", // Ensure title always exists
                notes: task.notes || ""
              }
            });
          });
        }
      } else {
        // Add task directly to project
        project.data.push({
          type: "to-do", // Must use "to-do" with hyphen
          attributes: {
            title: item.title || "Untitled Task", // Ensure title always exists
            notes: item.notes || ""
          }
        });
      }
    });
  }
  
  // Wrap project in items array
  const thingsData: ThingsData = {
    items: [project]
  };
  
  return generateDirectThingsURL(thingsData);
}

// Helper function to determine if input is already in Things3 format
function isThingsDataFormat(json: Record<string, unknown>): boolean {
  // Check for the specific Things3 data structure
  if (!json.items || !Array.isArray(json.items) || json.items.length === 0) {
    return false;
  }
  
  const firstItem = json.items[0] as Record<string, unknown>;
  
  return (
    !!firstItem && 
    typeof firstItem === 'object' &&
    firstItem.type === "project" &&
    !!firstItem.data &&
    Array.isArray(firstItem.data)
  );
}

// Helper function to create URL from ThingsData directly
function generateDirectThingsURL(data: ThingsData): string {
  // Validate the data has required fields
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    console.error("Invalid Things data structure:", data);
    throw new Error("Invalid Things data structure");
  }
  
  // Ensure all to-do items have titles
  data.items.forEach(project => {
    if (project.data && Array.isArray(project.data)) {
      project.data.forEach(item => {
        if (item.type === "to-do" && (!item.attributes || !item.attributes.title)) {
          console.error("To-do item missing required title:", item);
          if (!item.attributes) {
            // Create an attributes object with the required title
            Object.defineProperty(item, 'attributes', {
              value: { title: "Untitled Task" },
              writable: true,
              enumerable: true
            });
          } else {
            item.attributes.title = "Untitled Task";
          }
        }
      });
    }
  });
  
  // Convert to JSON string
  const jsonString = JSON.stringify(data);
  
  // Encode for URL
  const encodedJson = encodeURIComponent(jsonString);
  
  // Create the Things URL
  return `things:///json?data=${encodedJson}&reveal=true`;
}

/**
 * Generate sample data
 */
export const getSampleData = (): {
  title: string;
  notes: string;
  textFormat: string;
  jsonFormat: ThingsChecklist;
} => {
  const title = "Monday.com Integration";
  const notes = "Tasks for integrating Monday.com data into our coaching platform";
  
  const jsonFormat: ThingsChecklist = {
    title,
    notes,
    when: "anytime",
    items: [
      {
        title: "API Authentication Setup",
        type: 'heading',
        children: [
          {
            title: "Generate an API token from your Monday.com account",
            type: 'task'
          },
          {
            title: "Set up environment variables in your Next.js app for the token",
            type: 'task'
          }
        ]
      },
      {
        title: "Schema Alignment Analysis",
        type: 'heading',
        children: [
          {
            title: "Identify the Monday.com boards that contain your coaching data",
            type: 'task'
          },
          {
            title: "Map Monday.com columns to your Zod schema fields",
            type: 'task'
          },
          {
            title: "Identify any missing fields or information in your current schema",
            type: 'task'
          }
        ]
      },
      {
        title: "GraphQL Query Development",
        type: 'heading',
        children: [
          {
            title: "Learn the basic structure of Monday.com GraphQL queries",
            type: 'task'
          },
          {
            title: "Create GraphQL queries for each data type you need to fetch",
            type: 'task'
          },
          {
            title: "Test your queries in the Monday GraphQL API Explorer",
            type: 'task'
          }
        ]
      },
      {
        title: "API Client Implementation",
        type: 'heading',
        children: [
          {
            title: "Create a dedicated API client for Monday.com in your application",
            type: 'task'
          },
          {
            title: "Implement error handling and retry logic",
            type: 'task'
          },
          {
            title: "Create typed response interfaces that match your query results",
            type: 'task'
          }
        ]
      }
    ]
  };
  
  const textFormat = `1. API Authentication Setup
* Generate an API token from your Monday.com account
* Set up environment variables in your Next.js app for the token
2. Schema Alignment Analysis
* Identify the Monday.com boards that contain your coaching data
* Map Monday.com columns to your Zod schema fields
* Identify any missing fields or information in your current schema
3. GraphQL Query Development
* Learn the basic structure of Monday.com GraphQL queries
* Create GraphQL queries for each data type you need to fetch
* Test your queries in the Monday GraphQL API Explorer
4. API Client Implementation
* Create a dedicated API client for Monday.com in your application
* Implement error handling and retry logic
* Create typed response interfaces that match your query results`;

  return {
    title,
    notes,
    textFormat,
    jsonFormat
  };
}; 