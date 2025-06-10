// src/lib/data-schema/mongoose-schema/base-document.ts

import { modelOptions, prop } from '@typegoose/typegoose';
import { defaultModelOptions } from '@mongoose-schema/config';

/**
 * Base class for all MongoDB document models
 * Provides consistent transformation behavior
 * 
 * By extending this class, models inherit:
 * - Standard timestamps handling
 * - Consistent ID transformation
 * - Proper date formatting
 * - __v field removal
 * - ownerIds field for document ownership
 */
@modelOptions(defaultModelOptions)
export class BaseMongooseDocument {
  @prop({ type: () => [String], default: [] })
  ownerIds!: string[];
  
  // TypeGoose will add _id, createdAt, and updatedAt
}