import { findSchoolIdByName, findCoachIdByName } from "@data-utilities/transformers/reference-mappers";
import { formatDateFromMonday } from "@lib/domain/monday/monday-utils";
import { MondayFieldMapping } from "@/lib/types/domain/monday";

export const visitFieldMappings: Record<string, MondayFieldMapping> = {
  // Core required fields
  "date_column": {
    field: "date",
    required: true,
    transform: (value: string) => formatDateFromMonday(value)
  },
  "school_column": {
    field: "school",
    required: true,
    transform: async (value: string) => await findSchoolIdByName(value)
  },
  "coach_column": {
    field: "coach",
    required: true,
    transform: async (value: string) => await findCoachIdByName(value)
  },
  "cycle_column": {
    field: "cycleRef",
    required: true,
    transform: async (value: string) => {
      // Logic to find or create cycle reference
      return value;
    }
  },
  
  // Optional fields
  "site_address_column": {
    field: "siteAddress",
    required: false,
    transform: (value: string) => value
  },
  "end_date_column": {
    field: "endDate",
    required: false,
    transform: (value: string) => formatDateFromMonday(value)
  },
  "purpose_column": {
    field: "allowedPurpose",
    required: false,
    transform: (value: string) => {
      // Map to enum value if possible
      return value;
    }
  },
  "mode_column": {
    field: "modeDone",
    required: false,
    transform: (value: string) => {
      // Map to enum value if possible
      return value;
    }
  },
  "grade_levels_column": {
    field: "gradeLevelsSupported",
    required: true,
    transform: (value: string) => {
      // Convert to array of valid grade levels
      return value.split(',').map(g => g.trim());
    }
  },
}; 