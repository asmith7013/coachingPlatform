import { Types } from 'mongoose';

/**
 * Type specifically for Mongoose transform functions
 * Focuses on fields that need special handling during transformation
 */
export type MongooseTransformDocument = {
  _id?: Types.ObjectId | string;
  id?: string;
  __v?: unknown;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  [key: string]: unknown;
};

export interface RawMongoDocument extends Record<string, unknown> {
  _id?: unknown;
  __v?: number;
}
