// src/lib/integrations/monday/mappers/adapters/standard/visit-config.ts

import { EntityMappingConfig } from "@lib/integrations/monday/types/mapping";
import { VisitInput } from "@zod-schema/visits/visit";
import { baseVisitMappingConfig } from "@lib/integrations/monday/mappers/board-types/visits-board/config";

/**
 * Standard Board Visit Mapping Configuration
 * 
 * Extends the base Visit mapping configuration with board-specific mappings.
 */
export const standardBoardVisitMappingConfig: EntityMappingConfig<VisitInput> = {
  ...baseVisitMappingConfig,
  
  // Override with board-specific title mappings
  titleMappings: {
    ...baseVisitMappingConfig.titleMappings,
    // Add standard board specific column titles
    date: [...(baseVisitMappingConfig.titleMappings.date || []), "Visit Date", "Start Date"],
    school: [...(baseVisitMappingConfig.titleMappings.school || []), "School Name", "Site"],
    coach: [...(baseVisitMappingConfig.titleMappings.coach || []), "Lead Coach", "Primary Coach"],
  },
  
  // Override with board-specific ID pattern mappings
  idPatternMappings: {
    ...baseVisitMappingConfig.idPatternMappings,
    // Add standard board specific ID patterns
    "date": "date",
    "school": "school",
    "coach": "coach",
    "site": "school",
    "location": "school",
  }
}; 