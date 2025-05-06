import { 
  MondayItem, 
  MondayColumn, 
  MondayColumnValue,
  TransformResult 
} from "@api-monday/types";
import { VisitInput } from "@zod-schema/visits/visit";
import { 
  ModeDone, 
  AllowedPurpose,
  GradeLevelsSupportedZod 
} from "@enums";
// import { extractTextFromMondayValue } from "@/lib/integrations/monday/utils/monday-utils";

/**
 * Map Monday.com columns to Visit fields by using both title and type information
 * @param mondayItem The Monday.com item to map
 * @param boardColumns The columns from the board structure
 * @returns Mapped Visit data and list of missing required fields
 */
export function mapMondayColumnsToVisitFields(
  mondayItem: MondayItem, 
  boardColumns: MondayColumn[]
): { 
  visitData: Partial<VisitInput>;
  missingFields: string[];
} {
  
  const visitData: Partial<VisitInput> = {
    // Monday metadata
    mondayItemId: mondayItem.id,
    mondayBoardId: mondayItem.board_id,
    mondayItemName: mondayItem.name,
    mondayLastSyncedAt: new Date().toISOString(),
    
    // Initialize critical fields with empty values
    // These will flag as missing if not populated during mapping
    date: "",
    school: "",
    coach: "",
    cycleRef: "",
    
    // Initialize list fields as empty arrays
    owners: [] as string[],
    gradeLevelsSupported: [] as string[],
    
    // Optional fields with empty values
    modeDone: undefined,
    allowedPurpose: undefined,
    siteAddress: "",
  };

  console.log('[MONDAY DEBUG] Initial critical fields:', {
    date: visitData.date,
    school: visitData.school,
    coach: visitData.coach,
    dateType: typeof visitData.date,
    schoolType: typeof visitData.school,
    coachType: typeof visitData.coach
  });
  
  const missingFields: string[] = [];
  
  // Create a title-based mapping (column title -> Visit field)
  const titleMapping: Record<string, keyof VisitInput> = {
    // Date variations
    "Date": "date",
    "Session Date": "date",
    "Session Date or Range": "date",
    "Visit Date": "date",
    
    // School variations
    "School": "school",
    "School/Site Name": "school",
    "School Name": "school",
    "Site": "school",
    
    // Coach variations
    "Coach": "coach",
    "Assigned To": "coach",
    "Owner": "coach",
    "Person": "coach",
    
    // Cycle variations
    "Cycle": "cycleRef",
    "Reference": "cycleRef",
    "Cycle Number": "cycleRef",
    "Cycle Reference": "cycleRef",
    
    // Mode variations
    "Mode": "modeDone",
    "Visit Mode": "modeDone",
    "Delivery": "modeDone",
    "Status": "modeDone",
    
    // Purpose variations
    "Purpose": "allowedPurpose",
    "Visit Type": "allowedPurpose",
    "Type": "allowedPurpose",
    "Types": "allowedPurpose",
    
    // Grade variations
    "Grades": "gradeLevelsSupported",
    "Grade Levels": "gradeLevelsSupported",
    "Grade Level": "gradeLevelsSupported",
    "Grade": "gradeLevelsSupported",
    
    // Site address variations
    "Address": "siteAddress",
    "Location": "siteAddress",
    "Site Address": "siteAddress",
    
    // Owners variations
    "Owners": "owners",
    "Team Members": "owners",
    "CPM": "owners",
    "Stakeholders": "owners"
  };
  
  // Create maps for easier lookup
  const columnsByTitle: Record<string, MondayColumn> = {};
  boardColumns.forEach(col => {
    columnsByTitle[col.title] = col;
  });
  
  const valuesById: Record<string, MondayColumnValue> = {};
  mondayItem.column_values.forEach(val => {
    valuesById[val.id] = val;
  });
  
  // Process each board column
  boardColumns.forEach(column => {
    const fieldName = titleMapping[column.title];
    if (!fieldName) return; // Skip columns we don't care about
    
    const value = valuesById[column.id];
    if (!value || (!value.text && !value.value)) {
      // Missing required field
      if (isRequiredField(fieldName)) {
        missingFields.push(fieldName as string);
      }
      return;
    }
    
    console.log(`[MONDAY DEBUG] Processing field: ${fieldName} from column: ${column.title}`, {
      columnType: column.type,
      valueText: value.text,
      valueValue: value.value,
      currentFieldValue: visitData[fieldName],
      isArray: Array.isArray(visitData[fieldName])
    });
    
    // Use a type-safe assignment helper function
    setFieldValue(visitData, fieldName, value, column.type);
    
    console.log(`[MONDAY DEBUG] After setting field: ${fieldName}`, {
      newValue: visitData[fieldName],
      isArray: Array.isArray(visitData[fieldName]),
      arrayLength: Array.isArray(visitData[fieldName]) ? (visitData[fieldName] as unknown[]).length : 'N/A'
    });
  });
  
  // Handle special case: make sure coach is in owners
  if (visitData.coach && Array.isArray(visitData.owners)) {
    console.log('[MONDAY DEBUG] Before adding coach to owners:', {
      coach: visitData.coach,
      owners: visitData.owners,
      ownersType: Array.isArray(visitData.owners) ? 'Array' : typeof visitData.owners
    });
    
    if (!visitData.owners.includes(visitData.coach)) {
      visitData.owners.push(visitData.coach);
      
      console.log('[MONDAY DEBUG] After adding coach to owners:', {
        coach: visitData.coach,
        owners: visitData.owners,
        ownersLength: visitData.owners.length
      });
    }
  }
  
  // Check for missing required fields
  const requiredFields: Array<keyof VisitInput> = ["date", "school", "coach", "owners"];
  
  requiredFields.forEach(field => {
    if (visitData[field] === undefined || 
        (Array.isArray(visitData[field]) && (visitData[field] as unknown[]).length === 0)) {
      // Only add if not already in the list
      if (!missingFields.includes(field as string)) {
        missingFields.push(field as string);
      }
    }
  });
  
  console.log('[MONDAY DEBUG] Missing fields before fallback mapping:', missingFields);
  
  // Try to apply column ID mapping for fields still missing
  if (missingFields.length > 0) {
    handleFallbackMapping(visitData, valuesById, boardColumns, missingFields);
  }
  
  console.log('[MONDAY DEBUG] Final visitData after mapping:', {
    ...visitData,
    ownersType: Array.isArray(visitData.owners) ? 'Array' : typeof visitData.owners,
    ownersValue: visitData.owners,
    ownersLength: Array.isArray(visitData.owners) ? visitData.owners.length : 'N/A'
  });
  
  console.log('[MONDAY DEBUG] Final missing fields:', missingFields);
  
  console.log('[MONDAY DEBUG] Final critical fields after mapping:', {
    date: visitData.date,
    school: visitData.school,
    coach: visitData.coach,
    dateType: typeof visitData.date,
    schoolType: typeof visitData.school,
    coachType: typeof visitData.coach
  });
  
  return { visitData, missingFields };
}

/**
 * Extract a date from a timeline or date value
 */
function extractDateFromTimeline(value: MondayColumnValue): string {
  try {
    if (value.value) {
      const parsed = JSON.parse(value.value);
      if (parsed.from) {
        return parsed.from;
      } else if (parsed.date) {
        return parsed.date;
      }
    }
    
    // Fallback to text
    if (value.text) {
      const match = value.text.match(/(\d{4}-\d{2}-\d{2})/);
      if (match) {
        return match[1];
      }
    }
  } catch (e) {
    // Ignore parsing errors
    console.error('Error parsing timeline/date value:', e);
  }
  
  return "";
}

/**
 * Extract a person ID from a people column value
 */
function extractPersonId(value: MondayColumnValue): string {
  try {
    if (value.value) {
      const parsed = JSON.parse(value.value);
      if (parsed.personsAndTeams && parsed.personsAndTeams.length > 0) {
        return parsed.personsAndTeams[0].id.toString();
      }
    }
  } catch (e) {
    // Ignore parsing errors
    console.error('Error parsing people value:', e);
  }
  
  // Fallback to text
  return value.text || "";
}

/**
 * Extract multiple person IDs from a people column value
 */
function extractMultiplePersonIds(value: MondayColumnValue): string[] {
  const people: string[] = [];
  
  try {
    if (value.value) {
      const parsed = JSON.parse(value.value);
      if (parsed.personsAndTeams && parsed.personsAndTeams.length > 0) {
        return parsed.personsAndTeams.map((person: unknown) => (person as { id: string }).id.toString());
      }
    }
  } catch (e) {
    // Ignore parsing errors
    console.error('Error parsing multiple people value:', e);
  }
  
  // Fallback to text - not ideal, but better than nothing
  if (value.text) {
    people.push(value.text);
  }
  
  return people;
}

/**
 * Map Monday mode status to our enum
 */
function mapModeStatus(text: string | null): ModeDone | undefined {
  if (!text) return undefined;
  
  const modeMap: Record<string, ModeDone> = {
    "In Person": "In-person" as ModeDone,
    "In-person": "In-person" as ModeDone,
    "Virtual": "Virtual" as ModeDone,
    "Hybrid": "Hybrid" as ModeDone
  };
  
  return modeMap[text];
}

/**
 * Map Monday allowed purpose to our enum
 */
function mapAllowedPurpose(text: string | null): AllowedPurpose | undefined {
  if (!text) return undefined;
  
  const purposeMap: Record<string, AllowedPurpose> = {
    "Walkthrough": "Initial Walkthrough" as AllowedPurpose,
    "Initial Walkthrough": "Initial Walkthrough" as AllowedPurpose,
    "1:1 Teacher Coaching": "Visit" as AllowedPurpose,
    "Visit": "Visit" as AllowedPurpose,
    "Team Coaching": "Visit" as AllowedPurpose,
    "Final Walkthrough": "Final Walkthrough" as AllowedPurpose
  };
  
  return purposeMap[text];
}

/**
 * Map grade levels from text to our enum values
 */
function mapGradeLevels(text: string | null): string[] {
  if (!text) return [];
  
  const grades: string[] = [];
  const validGrades = GradeLevelsSupportedZod.options;
  
  // Handle potential JSON array
  try {
    if (text.startsWith('[')) {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        parsed.forEach(grade => {
          if (validGrades.includes(grade)) {
            grades.push(grade);
          }
        });
        return grades;
      }
    }
  } catch {
    // Not JSON, continue with string processing
  }
  
  // Check for direct grade matches in text
  validGrades.forEach(grade => {
    if (text.includes(grade)) {
      grades.push(grade);
    }
  });
  
  // Handle abbreviations
  if (text.match(/\bK\b/) && !grades.includes("Kindergarten")) {
    grades.push("Kindergarten");
  }
  
  for (let i = 1; i <= 12; i++) {
    const gradeStr = `Grade ${i}`;
    // Look for various formats: G6, Gr6, Grade 6, 6th grade, etc.
    if (
      (text.match(new RegExp(`\\bG${i}\\b`)) || 
       text.match(new RegExp(`\\bGr${i}\\b`)) ||
       text.match(new RegExp(`\\bGrade ${i}\\b`)) ||
       text.match(new RegExp(`\\b${i}th\\b`)) ||
       text.match(new RegExp(`\\b${i}$`))
      ) && !grades.includes(gradeStr)
    ) {
      grades.push(gradeStr);
    }
  }
  
  return grades;
}

/**
 * Check if a field is required
 */
function isRequiredField(field: keyof VisitInput): boolean {
  return ["date", "school", "coach", "owners"].includes(field as string);
}

/**
 * Try to map fields using column IDs and types as a fallback
 */
function handleFallbackMapping(
  visitData: Partial<VisitInput>,
  valuesById: Record<string, MondayColumnValue>,
  boardColumns: MondayColumn[],
  missingFields: string[]
): void {
  // Map from column ID patterns to field names
  const idPatterns: Record<string, keyof VisitInput> = {
    "date": "date",
    "timeline": "date",
    "school": "school",
    "site": "school",
    "coach": "coach",
    "person": "coach",
    "cycle": "cycleRef",
    "reference": "cycleRef",
    "mode": "modeDone",
    "delivery": "modeDone",
    "status": "modeDone",
    "purpose": "allowedPurpose",
    "type": "allowedPurpose",
    "grade": "gradeLevelsSupported",
    "grades": "gradeLevelsSupported",
    "address": "siteAddress",
    "location": "siteAddress",
    "owner": "owners",
    "team": "owners"
  };
  
  // Column type matching as last resort
  const typeMatching: Record<string, Array<keyof VisitInput>> = {
    "date": ["date"],
    "timeline": ["date"],
    "people": ["coach", "owners"],
    "text": ["school", "cycleRef", "siteAddress"],
    "status": ["modeDone", "allowedPurpose"],
    "dropdown": ["allowedPurpose", "gradeLevelsSupported"]
  };
  
  // First try to match by column ID patterns
  Object.entries(valuesById).forEach(([colId, value]) => {
    // Skip if no value
    if (!value || (!value.text && !value.value)) return;
    
    // Try to find matching field by ID pattern
    let matchedField: keyof VisitInput | undefined;
    for (const [pattern, fieldName] of Object.entries(idPatterns)) {
      if (colId.toLowerCase().includes(pattern.toLowerCase())) {
        matchedField = fieldName;
        break;
      }
    }
    
    if (matchedField && isFieldMissing(visitData, matchedField, missingFields)) {
      // Find the column definition to get its type
      const column = boardColumns.find(col => col.id === colId);
      if (!column) return;
      
      // Process based on field name and column type
      applyValueToField(visitData, matchedField, value, column.type);
      
      // Remove from missing fields if set successfully
      if (!isFieldMissing(visitData, matchedField, [])) {
        const index = missingFields.indexOf(matchedField as string);
        if (index >= 0) {
          missingFields.splice(index, 1);
        }
      }
    }
  });
  
  // If still missing fields, try type-based matching as last resort
  if (missingFields.length > 0) {
    boardColumns.forEach(column => {
      const potentialFields = typeMatching[column.type];
      if (!potentialFields) return;
      
      // Find the first missing field that matches this type
      const fieldToFill = potentialFields.find(field => 
        isFieldMissing(visitData, field, missingFields)
      );
      
      if (fieldToFill) {
        const value = valuesById[column.id];
        if (!value || (!value.text && !value.value)) return;
        
        applyValueToField(visitData, fieldToFill, value, column.type);
        
        // Remove from missing fields if set successfully
        if (!isFieldMissing(visitData, fieldToFill, [])) {
          const index = missingFields.indexOf(fieldToFill as string);
          if (index >= 0) {
            missingFields.splice(index, 1);
          }
        }
      }
    });
  }
}

/**
 * Check if a field is missing or empty
 */
function isFieldMissing(
  data: Partial<VisitInput>,
  field: keyof VisitInput,
  missingFields: string[]
): boolean {
  // If it's in the missing fields list, it's definitely missing
  if (missingFields.includes(field as string)) return true;
  
  // Check if it's undefined or empty array
  return data[field] === undefined || 
    (Array.isArray(data[field]) && (data[field] as unknown[]).length === 0);
}

/**
 * Apply a value to a field based on field name and column type
 */
function applyValueToField(
  data: Partial<VisitInput>,
  field: keyof VisitInput,
  value: MondayColumnValue,
  columnType: string
): void {
  // Use the same type-safe setting function
  setFieldValue(data, field, value, columnType);
}

/**
 * Type-safe setter for field values that handles various field types correctly
 */
function setFieldValue(
  data: Partial<VisitInput>,
  field: keyof VisitInput,
  value: MondayColumnValue,
  columnType: string
): void {
  // Process based on field name and column type
  switch (field) {
    case "date":
      if (columnType === "date" || columnType === "timeline") {
        data.date = extractDateFromTimeline(value);
      } else {
        data.date = value.text || "";
      }
      break;
      
    case "coach":
      if (columnType === "people") {
        data.coach = extractPersonId(value);
      } else {
        data.coach = value.text || "";
      }
      break;
      
    case "owners":
      if (columnType === "people" || columnType === "multiple-person") {
        const people = columnType === "multiple-person" 
          ? extractMultiplePersonIds(value)
          : [extractPersonId(value)];
          
        if (!data.owners) {
          data.owners = [];
        }
        
        people.forEach(person => {
          if (person && !data.owners!.includes(person)) {
            data.owners!.push(person);
          }
        });
      } else if (value.text) {
        if (!data.owners) {
          data.owners = [];
        }
        if (value.text && !data.owners.includes(value.text)) {
          data.owners.push(value.text);
        }
      }
      break;
      
    case "modeDone":
      data.modeDone = mapModeStatus(value.text);
      break;
      
    case "allowedPurpose":
      data.allowedPurpose = mapAllowedPurpose(value.text);
      break;
      
    case "gradeLevelsSupported":
      if (columnType === "dropdown" || columnType === "tags") {
        data.gradeLevelsSupported = mapGradeLevels(value.text);
      } else if (value.text) {
        // Text column with grades
        data.gradeLevelsSupported = mapGradeLevels(value.text);
      }
      break;
      
    case "school":
    case "cycleRef":
    case "siteAddress":
    case "mondayItemId":
    case "mondayBoardId":
    case "mondayItemName":
    case "mondayLastSyncedAt":
    case "endDate":
      // Simple string fields
      data[field] = value.text || "";
      break;
      
    default:
      // For any other fields, use string value
      // This is needed for TypeScript to treat the field as a generic property
      (data as Record<string, unknown>)[field as string] = value.text || "";
      break;
  }
}

/**
 * Main function to transform a Monday.com item to a Visit
 * This is the function to be called from outside modules
 */
export function dynamicTransformMondayItemToVisit(
  mondayItem: MondayItem, 
  boardColumns: MondayColumn[]
): { 
  visitData: Partial<VisitInput>;
  missingFields: string[];
} {
  const result = mapMondayColumnsToVisitFields(mondayItem, boardColumns);
  
  // Add debug logging to see what's going back
  console.log('[MONDAY DEBUG] Mapper result:', {
    visitData: result.visitData,
    hasDate: 'date' in result.visitData,
    hasSchool: 'school' in result.visitData,
    hasCoach: 'coach' in result.visitData,
    dateValue: result.visitData.date,
    schoolValue: result.visitData.school,
    coachValue: result.visitData.coach,
    missingFields: result.missingFields
  });
  
  // Ensure critical fields are preserved in the return value
  const safeVisitData = {
    ...result.visitData,
    // Critical fields are always present, even if empty
    date: typeof result.visitData.date === 'string' ? result.visitData.date : "",
    school: typeof result.visitData.school === 'string' ? result.visitData.school : "",
    coach: typeof result.visitData.coach === 'string' ? result.visitData.coach : "",
    cycleRef: typeof result.visitData.cycleRef === 'string' ? result.visitData.cycleRef : "",
    // Ensure array fields are preserved
    owners: Array.isArray(result.visitData.owners) ? result.visitData.owners : []
  };
  
  return { 
    visitData: safeVisitData, 
    missingFields: result.missingFields 
  };
}

/**
 * Enhanced transform function that returns a standard TransformResult
 * Compatible with the existing transform-service pattern
 */
export function enhancedTransformMondayItemToVisit(
  mondayItem: MondayItem, 
  boardColumns: MondayColumn[]
): TransformResult {
  const { visitData: originalVisitData, missingFields } = mapMondayColumnsToVisitFields(mondayItem, boardColumns);
  
  // Ensure critical fields are preserved in the return value
  const safeVisitData = {
    ...originalVisitData,
    // Critical fields are always present, even if empty
    date: typeof originalVisitData.date === 'string' ? originalVisitData.date : "",
    school: typeof originalVisitData.school === 'string' ? originalVisitData.school : "",
    coach: typeof originalVisitData.coach === 'string' ? originalVisitData.coach : "",
    cycleRef: typeof originalVisitData.cycleRef === 'string' ? originalVisitData.cycleRef : "",
    // Ensure array fields are preserved
    owners: Array.isArray(originalVisitData.owners) ? originalVisitData.owners : []
  };
  
  // Determine overall validity
  const valid = missingFields.length === 0;
  
  console.log('[MONDAY DEBUG] Enhanced transform result:', {
    visitData: safeVisitData,
    hasDate: 'date' in safeVisitData,
    hasSchool: 'school' in safeVisitData,
    hasCoach: 'coach' in safeVisitData,
    dateValue: safeVisitData.date,
    schoolValue: safeVisitData.school,
    coachValue: safeVisitData.coach,
    missingFields: missingFields
  });
  
  return {
    transformed: safeVisitData,
    valid,
    success: valid,
    missingRequired: missingFields,
    errors: missingFields.reduce((acc, field) => {
      acc[field] = `Required field '${field}' is missing`;
      return acc;
    }, {} as Record<string, string>)
  };
} 