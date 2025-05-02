import { SchemaTransformer } from "../../utils/transformer";
import { baseVisitMappingConfig } from "./config";
import { EntityMappingConfig } from "../../utils/config-types";
import { MondayItem, MondayColumn, TransformResult } from "@/lib/integrations/monday/types";
import { VisitInput } from "@/lib/data-schema/zod-schema/visits/visit";

/**
 * Visit Mapper
 * 
 * Maps Monday.com items to Visit entities using the provided configuration.
 */
export class VisitMapper extends SchemaTransformer<VisitInput> {
  constructor(config: EntityMappingConfig<VisitInput> = baseVisitMappingConfig) {
    super(config);
  }

  /**
   * Initialize entity data with Visit-specific defaults
   */
  protected initializeEntityData(mondayItem: MondayItem): Partial<VisitInput> {
    const baseData = super.initializeEntityData(mondayItem);
    return {
      ...baseData,
      gradeLevelsSupported: [],
      owners: []
    } as unknown as Partial<VisitInput>;
  }

  /**
   * Post-process entity data for Visit-specific requirements
   */
  // protected postProcessEntityData(data: Partial<VisitInput>): void {
  //   // Ensure coach is included in owners array if present
  //   if (data.coach && data.owners && !data.owners.includes(data.coach)) {
  //     data.owners.push(data.coach);
  //   }
  // }

  /**
   * Transform a Monday item to a Visit entity
   */
  transformMondayItemToVisitEntity(
    mondayItem: MondayItem,
    boardColumns: MondayColumn[]
  ): TransformResult {
    return this.transformMondayItemToEntity(mondayItem, boardColumns);
  }
}

/**
 * Transform a Monday item to a Visit entity
 * 
 * @param mondayItem The Monday item to transform
 * @param boardColumns Board columns for column matching
 * @returns The visit data and any missing required fields
 */
export function transformMondayItemToVisit(
  mondayItem: MondayItem,
  boardColumns: MondayColumn[]
): TransformResult {
  const mapper = new VisitMapper();
  return mapper.transformMondayItemToVisitEntity(mondayItem, boardColumns);
}

/**
 * Enhanced transformer for transforming a Monday item to a Visit entity
 * Returns a standard TransformResult
 */
export function enhancedTransformMondayItemToVisit(
  mondayItem: MondayItem,
  boardColumns: MondayColumn[]
): TransformResult {
  return transformMondayItemToVisit(mondayItem, boardColumns);
} 