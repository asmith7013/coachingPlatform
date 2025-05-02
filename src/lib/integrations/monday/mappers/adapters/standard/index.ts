import { MondayColumn, TransformResult } from "@/lib/integrations/monday/types";
import { VisitMapper } from "@/lib/integrations/monday/mappers/schemas/visit";
import { standardBoardVisitMappingConfig } from "./visit-config";
import { MondayItem, MondayColumnValue } from "@/lib/integrations/monday/types";

/**
 * Standard Board Visit Mapper
 * 
 * Specialized mapper for transforming Monday items from the standard board
 * to Visit entities.
 */
export class StandardBoardVisitMapper extends VisitMapper {
  constructor() {
    super(standardBoardVisitMappingConfig);
  }
  
  // Add any board-specific overrides or methods
  // For example, you could override postProcessEntityData to add
  // board-specific post-processing
}

/**
 * Transform a Monday item from the standard board to a Visit entity
 * 
 * @param mondayItem The Monday item to transform
 * @param boardColumns Optional board columns for column matching
 * @returns The transformed Visit entity and any missing required fields
 */
export function transformStandardBoardItemToVisit(
  mondayItem: MondayItem,
  boardColumns?: MondayColumnValue[]
): TransformResult {
  const mapper = new StandardBoardVisitMapper();
  return mapper.transformMondayItemToVisitEntity(mondayItem, boardColumns as unknown as MondayColumn[]);
}
