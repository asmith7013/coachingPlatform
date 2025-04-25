import { Document, Types } from "mongoose";

/**
 * Basic document interface that all document types should extend.
 * This ensures consistent properties across document types.
 */
export interface BaseDocument extends Document {
  _id: Types.ObjectId;
  [key: string]: unknown;
} 