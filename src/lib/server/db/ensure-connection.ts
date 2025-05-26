import { connectToDB } from "@server/db/connection";

/**
 * Ensures database connection is established before executing an operation
 * @param operation The async operation to execute after ensuring connection
 * @returns The result of the operation
 */
export async function withDbConnection<T>(operation: () => Promise<T>): Promise<T> {
  await connectToDB();
  return operation();
} 