// src/lib/integrations/monday/mappers/schemas/visit/config.ts

import { EntityMappingConfig } from "../../utils/config-types";
import { VisitInput } from "@/lib/data-schema/zod-schema/visits/visit";
import { 
  dateTransformer,
  textTransformer,
  personTransformer,
  peopleTransformer
} from "../../utils/value-transformers";
import {
  modeDoneTransformer,
  allowedPurposeTransformer,
  gradeLevelsTransformer
} from "./transformers";

/**
 * Base Visit entity mapping configuration
 * This can be extended for specific Monday boards
 */
export const baseVisitMappingConfig: EntityMappingConfig<VisitInput> = {
  titleMappings: {
    // Date field variations
    date: [
      "Date", 
      "Session Date", 
      "Session Date or Range", 
      "Visit Date"
    ],
    // School variations
    school: [
      "School", 
      "School/Site Name", 
      "School Name", 
      "Site"
    ],
    // Coach variations
    coach: [
      "Coach", 
      "Assigned To", 
      "Owner", 
      "Person"
    ],
    // Cycle variations
    cycleRef: [
      "Cycle", 
      "Reference", 
      "Cycle Number", 
      "Cycle Reference"
    ],
    // Mode variations
    modeDone: [
      "Mode", 
      "Visit Mode", 
      "Delivery", 
      "Status"
    ],
    // Purpose variations
    allowedPurpose: [
      "Purpose", 
      "Visit Type", 
      "Type", 
      "Types"
    ],
    // Grade variations
    gradeLevelsSupported: [
      "Grades", 
      "Grade Levels", 
      "Grade Level", 
      "Grade"
    ],
    // Address variations
    siteAddress: [
      "Address", 
      "Location", 
      "Site Address"
    ],
    // Owners variations
    owners: [
      "Owners", 
      "Team Members", 
      "CPM", 
      "Stakeholders"
    ],
    // Required for TypeScript, but these will be auto-set
    mondayItemId: [],
    mondayBoardId: [],
    mondayItemName: [],
    mondayLastSyncedAt: [],
    // Optional fields that might not have direct mappings
    events: [],
    sessionLinks: [],
    endDate: []
  },
  
  // Type-based fallbacks when column titles don't match
  typeMappings: {
    "date": ["date"],
    "timeline": ["date"],
    "people": ["coach", "owners"],
    "text": ["school", "cycleRef", "siteAddress"],
    "status": ["modeDone", "allowedPurpose"],
    "dropdown": ["allowedPurpose", "gradeLevelsSupported"]
  },
  
  // ID-pattern based fallbacks 
  idPatternMappings: {
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
  },
  
  // Value transformers for specific fields
  valueTransformers: {
    date: dateTransformer,
    school: textTransformer,
    coach: personTransformer,
    cycleRef: textTransformer,
    modeDone: modeDoneTransformer,
    allowedPurpose: allowedPurposeTransformer,
    gradeLevelsSupported: gradeLevelsTransformer,
    siteAddress: textTransformer,
    owners: peopleTransformer
  },
  
  // Required fields for validation
  requiredFields: ["date", "school", "coach", "owners"]
}; 