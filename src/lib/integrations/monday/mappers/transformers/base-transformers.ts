// src/lib/integrations/monday/mappers/schemas/visit/transformers.ts

import { MondayColumnValue } from "@lib/integrations/monday/types/board";
import { ValueTransformer } from "@lib/integrations/monday/types/mapping";
import { 
  ModeDone, 
  AllowedPurpose,
  GradeLevelsSupportedZod 
} from "@enums";

/**
 * Map Monday mode status to our enum
 */
export const modeDoneTransformer: ValueTransformer<ModeDone | undefined> = 
  (value: MondayColumnValue) => {
    if (!value.text) return undefined;
    
    const modeMap: Record<string, ModeDone> = {
      "In Person": "In-person" as ModeDone,
      "In-person": "In-person" as ModeDone, 
      "Virtual": "Virtual" as ModeDone,
      "Hybrid": "Hybrid" as ModeDone
    };
    
    return modeMap[value.text];
  };

/**
 * Map Monday allowed purpose to our enum
 */
export const allowedPurposeTransformer: ValueTransformer<AllowedPurpose | undefined> = 
  (value: MondayColumnValue) => {
    if (!value.text) return undefined;
    
    const purposeMap: Record<string, AllowedPurpose> = {
      "Walkthrough": "Initial Walkthrough" as AllowedPurpose,
      "Initial Walkthrough": "Initial Walkthrough" as AllowedPurpose,
      "1:1 Teacher Coaching": "Visit" as AllowedPurpose,
      "Visit": "Visit" as AllowedPurpose,
      "Team Coaching": "Visit" as AllowedPurpose,
      "Final Walkthrough": "Final Walkthrough" as AllowedPurpose
    };
    
    return purposeMap[value.text];
  };

/**
 * Map grade levels from text to our enum values
 */
export const gradeLevelsTransformer: ValueTransformer<string[]> = 
  (value: MondayColumnValue) => {
    if (!value.text) return [];
    
    const grades: string[] = [];
    const validGrades = GradeLevelsSupportedZod.options;
    const text = value.text || ''; // Ensure text is not null
    
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
  }; 