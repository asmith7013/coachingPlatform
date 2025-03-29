import { handleClientError } from "@/lib/error/handleClientError";

export async function handleErrorHandledMutation<T>(
  mutationFn: () => Promise<T>,
  context: string,
  afterSuccess?: () => void
): Promise<T> {
  try {
    const result = await mutationFn();
    if (afterSuccess) afterSuccess();
    return result;
  } catch (err) {
    const errorMessage = handleClientError(err, context);
    console.error(`❌ ${context} failed:`, errorMessage);
    throw new Error(errorMessage);
  }
} 