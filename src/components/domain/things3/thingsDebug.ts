/**
 * Troubleshooter for Things 3 URL scheme JSON format
 */
import { 
  ThingsData, 
  ThingsHeading, 
  ThingsTodo, 
  ThingsChecklist 
} from '@domain-types/things3-types';

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

interface UrlLengthInfo {
  tooLong: boolean;
  length: number;
  recommendation: string;
}

/**
 * Validate Things 3 JSON structure
 */
export function validateThingsJson(json: unknown): ValidationResult {
  const errors: string[] = [];

  try {
    // 1. Check if it's an object
    if (typeof json !== 'object' || json === null) {
      errors.push('JSON must be an object');
      return { valid: false, errors };
    }

    const thingsJson = json as Record<string, unknown>;

    // 2. Check if it has 'items' array
    if (!Array.isArray(thingsJson.items)) {
      errors.push('JSON must have an "items" array at the top level');
      return { valid: false, errors };
    }

    // 3. Check each project in items array
    thingsJson.items.forEach((item: unknown, index: number) => {
      if (typeof item !== 'object' || item === null) {
        errors.push(`Item ${index} must be an object`);
        return;
      }

      const projectItem = item as Record<string, unknown>;

      // 3.1 Verify it's a project
      if (projectItem.type !== 'project') {
        errors.push(`Item ${index} must have type "project"`);
      }

      // 3.2 Verify it has attributes
      if (!projectItem.attributes || typeof projectItem.attributes !== 'object') {
        errors.push(`Project ${index} must have "attributes" object`);
      } else {
        const attributes = projectItem.attributes as Record<string, unknown>;
        if (!attributes.title) {
          errors.push(`Project ${index} must have a title`);
        }
      }

      // 3.3 Verify it has data array
      if (!Array.isArray(projectItem.data)) {
        errors.push(`Project ${index} must have a "data" array (not "items" or "children")`);
      } else {
        // 3.4 Verify each item in the data array
        (projectItem.data as unknown[]).forEach((dataItem: unknown, dataIndex: number) => {
          if (typeof dataItem !== 'object' || dataItem === null) {
            errors.push(`Project ${index}, data item ${dataIndex} must be an object`);
            return;
          }

          const thingsItem = dataItem as Record<string, unknown>;
          
          if (thingsItem.type !== 'heading' && thingsItem.type !== 'to-do') {
            errors.push(`Project ${index}, data item ${dataIndex} has invalid type "${thingsItem.type}". Must be "heading" or "to-do"`);
          }

          if (!thingsItem.attributes || typeof thingsItem.attributes !== 'object') {
            errors.push(`Project ${index}, data item ${dataIndex} must have attributes with a title`);
          } else {
            const attributes = thingsItem.attributes as Record<string, unknown>;
            if (!attributes.title) {
              errors.push(`Project ${index}, data item ${dataIndex} must have a title`);
            }
          }
        });
      }
    });

    return { valid: errors.length === 0, errors };
  } catch (err) {
    errors.push(`JSON parsing error: ${(err as Error).message}`);
    return { valid: false, errors };
  }
}

/**
 * Create a simple test Things project to validate the approach
 */
export function createSimpleTestProject(): ThingsData {
  // Create a simple project that follows the exact Things 3 URL scheme format
  return {
    items: [
      {
        type: "project", // Project type at the top level
        attributes: {
          title: "Simple Test Project",
          notes: "This is a test project to verify the Things URL scheme",
          when: "anytime"
        },
        data: [ // IMPORTANT: Use "data" array, not "items" or "children"
          {
            type: "heading", // Section heading
            attributes: {
              title: "First Section"
            }
          },
          {
            type: "to-do", // IMPORTANT: Use "to-do" with hyphen
            attributes: {
              title: "First task",
              notes: "Task notes"
            }
          }
        ]
      }
    ]
  };
}

/**
 * Create Things 3 URL from JSON data
 */
export function generateThingsUrl(data: ThingsData): string {
  const jsonString = JSON.stringify(data);
  const encodedJson = encodeURIComponent(jsonString);
  return `things:///json?data=${encodedJson}&reveal=true`;
}

/**
 * Check if URL length might be an issue
 */
export function checkUrlLength(url: string): UrlLengthInfo {
  const length = url.length;
  const tooLong = length > 5000; // Conservative limit based on general URL length concerns
  
  return {
    tooLong,
    length,
    recommendation: tooLong 
      ? 'URL is quite long. Consider breaking up into smaller projects or simplifying the structure.'
      : 'URL length should be acceptable.'
  };
}

/**
 * Fix common issues in Things JSON
 */
export function fixCommonIssues(data: unknown): ThingsData {
  // Clone the object to avoid mutations
  const result = JSON.parse(JSON.stringify(data)) as {
    type?: string;
    title?: string;
    notes?: string;
    when?: string;
    items?: unknown[];
    // Allow any other properties
    [key: string]: unknown;
  };
  
  // 1. Fix project level
  if (!Array.isArray(result.items)) {
    // Maybe the user passed just a project object
    if (result.type === 'project') {
      result.items = [{ ...result, items: undefined }];
    } else {
      // Otherwise, wrap whatever we have in a default project
      result.items = [{
        type: "project",
        attributes: {
          title: result.title || "Imported Project",
          notes: result.notes || "",
          when: result.when || "anytime"
        },
        data: []
      }];
    }
  }
  
  // 2. Process each project
  if (Array.isArray(result.items)) {
    result.items.forEach((projectItem) => {
      // Cast to a workable type
      const project = projectItem as {
        type: string;
        attributes?: Record<string, unknown>;
        data?: unknown[];
        items?: unknown[];
        children?: unknown[];
        [key: string]: unknown;
      };
      
      // 2.1 Fix project type
      if (project.type !== 'project') {
        project.type = 'project';
      }
      
      // 2.2 Ensure attributes exist
      if (!project.attributes) {
        project.attributes = { title: "Imported Project" };
      }
      
      // 2.3 Fix data array issues - IMPORTANT: Things 3 requires "data" array, not "items" or "children"
      if (!Array.isArray(project.data)) {
        // Check if items or children arrays exist and use those
        if (Array.isArray(project.items)) {
          project.data = project.items;
          delete project.items; // Remove the incorrect property
        } else if (Array.isArray(project.children)) {
          project.data = project.children;
          delete project.children; // Remove the incorrect property
        } else {
          project.data = [];
        }
      }
      
      // 2.4 Fix items in the data array
      if (Array.isArray(project.data)) {
        project.data.forEach((todoItem) => {
          // Cast to a workable type
          const item = todoItem as {
            type?: string;
            title?: string;
            attributes?: Record<string, unknown>;
            [key: string]: unknown;
          };
          
          // Fix todo type - IMPORTANT: Things 3 requires "to-do" with a hyphen
          if (item.type === 'todo' || item.type === 'task') {
            item.type = 'to-do'; // Correct format with hyphen
          }
          
          // Ensure attributes
          if (!item.attributes) {
            item.attributes = { title: item.title || "Untitled Item" };
          }
        });
      }
    });
  }
  
  return result as ThingsData;
}

/**
 * Convert a ThingsChecklist (internal format) to ThingsData (Things 3 format)
 */
export function convertChecklistToThingsData(checklist: ThingsChecklist): ThingsData {
  // Create the base ThingsData structure with proper format
  const thingsData: ThingsData = {
    items: [
      {
        type: "project",
        attributes: {
          title: checklist.title || "Imported Project",
          notes: checklist.notes || "",
          when: checklist.when || "anytime"
        },
        data: [] // IMPORTANT: Things 3 requires "data" array at the project level, not "items"
      }
    ]
  };
  
  // Process each item in the checklist
  checklist.items.forEach(item => {
    if (item.type === 'heading') {
      // Add heading
      const heading: ThingsHeading = {
        type: "heading",
        attributes: {
          title: item.title
        }
      };
      thingsData.items[0].data.push(heading);
      
      // Add tasks under this heading
      if (item.children && item.children.length > 0) {
        item.children.forEach(child => {
          const todo: ThingsTodo = {
            type: "to-do", // IMPORTANT: Things 3 requires "to-do" with hyphen
            attributes: {
              title: child.title,
              notes: child.notes || ""
            }
          };
          thingsData.items[0].data.push(todo);
        });
      }
    } else {
      // Add task directly to project
      const todo: ThingsTodo = {
        type: "to-do", // IMPORTANT: Things 3 requires "to-do" with hyphen
        attributes: {
          title: item.title,
          notes: item.notes || ""
        }
      };
      thingsData.items[0].data.push(todo);
    }
  });
  
  return thingsData;
}

interface TroubleshootResult {
  originalData: unknown;
  validationResult: ValidationResult;
  fixedData: ThingsData;
  simpleTestData: ThingsData;
  generatedUrl: string;
  fixedUrl: string;
  simpleTestUrl: string;
  urlLengthInfo: UrlLengthInfo;
}

/**
 * Main troubleshooting function
 */
export function troubleshootThingsUrl(jsonData: unknown): TroubleshootResult {
  // Parse the JSON if it's a string
  const originalData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
  
  let parsedData: ThingsData;
  
  const dataRecord = originalData as Record<string, unknown>;
  
  // Check if this is a ThingsChecklist and convert if needed
  if (Array.isArray(dataRecord.items) && 
      dataRecord.items.length > 0) {
      
    const firstItem = dataRecord.items[0] as Record<string, unknown>;
    
    // Check if this is our internal format (with heading/task types)
    if (firstItem.type === 'heading' || firstItem.type === 'task') {
      parsedData = convertChecklistToThingsData(originalData as ThingsChecklist);
    } else {
      // Already in Things Data format, but might need fixes
      parsedData = originalData as ThingsData;
    }
  } else {
    // Not a valid format, apply aggressive fixing
    parsedData = fixCommonIssues(dataRecord);
  }
  
  // Validate the original data
  const validationResult = validateThingsJson(parsedData);
  
  // Fix common issues to ensure Things 3 compatibility
  const fixedData = fixCommonIssues(parsedData);
  
  // Create a simple test project as reference
  const simpleTestData = createSimpleTestProject();
  
  // Generate URLs for comparison
  let generatedUrl: string;
  try {
    generatedUrl = generateThingsUrl(parsedData);
  } catch (error) {
    generatedUrl = 'Error generating URL from original data: ' + (error as Error).message;
  }
  
  const fixedUrl = generateThingsUrl(fixedData);
  const simpleTestUrl = generateThingsUrl(simpleTestData);
  
  // Check URL length for potential issues
  const urlLengthInfo = checkUrlLength(fixedUrl);
  
  return {
    originalData,
    validationResult,
    fixedData,
    simpleTestData,
    generatedUrl,
    fixedUrl,
    simpleTestUrl,
    urlLengthInfo
  };
}

// Example usage in comments:
/*
// For a ThingsChecklist format:
const checklistData = {
  title: "Monday.com Integration Checklist",
  notes: "Step-by-step plan for integrating Monday.com data",
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
        // more tasks...
      ]
    }
    // more sections...
  ]
};

// For a direct Things 3 format:
const thingsData = {
  items: [
    {
      type: "project",
      attributes: {
        title: "Monday.com Integration",
        notes: "Tasks for Monday.com integration",
        when: "anytime" 
      },
      data: [
        {
          type: "heading",
          attributes: {
            title: "API Authentication Setup"
          }
        },
        {
          type: "to-do", // Note the hyphen!
          attributes: {
            title: "Generate an API token",
            notes: "Log into Monday.com and create a token"
          }
        }
      ]
    }
  ]
};

const results = troubleshootThingsUrl(checklistData);
console.log("Validation errors:", results.validationResult.errors);
console.log("Fixed URL:", results.fixedUrl);
console.log("Simple test URL:", results.simpleTestUrl);
*/ 