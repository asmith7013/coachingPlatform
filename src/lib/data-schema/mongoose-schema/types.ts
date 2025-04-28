// In src/lib/data-schema/mongoose-schema/types.ts
// import { Document } from 'mongoose';
// import { BaseDocument } from '@core-types/document';

/**
 * Mongoose document interface that extends the base document
 * Adds Mongoose-specific functionality while maintaining property compatibility
 */
// export interface MongooseDocument extends Document, Omit<BaseDocument, '_id'> {
//   // Mongoose already has _id, so we omit it to avoid conflicts
//   // But we ensure all other BaseDocument properties are included
// }