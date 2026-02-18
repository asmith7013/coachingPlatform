import mongoose from "mongoose";
import { connectToDB } from "./connection";

// Create a type alias for mongoose models with generic document type
type MongooseAnyModel = mongoose.Model<mongoose.Document>;

// Use the type alias in your cache
const modelsCache: Record<string, MongooseAnyModel> = {};

export async function getModel<T>(
  name: string,
  createModel: () => mongoose.Model<T>,
): Promise<mongoose.Model<T>> {
  // Ensure DB connection
  await connectToDB();

  // Check mongoose models first
  if (mongoose.models[name]) {
    return mongoose.models[name] as mongoose.Model<T>;
  }

  // Check our cache next
  if (modelsCache[name]) {
    return modelsCache[name] as unknown as mongoose.Model<T>;
  }

  // Create and cache the model if it doesn't exist
  const model = createModel();
  modelsCache[name] = model as unknown as MongooseAnyModel;
  return model;
}
