import useSWR from "swr";
import { handleClientError } from "@/lib/error/handleClientError";

type Fetcher<T> = () => Promise<T>;

export function useSafeSWR<T>(
  key: string | readonly unknown[] | null,
  fetcher: Fetcher<T>,
  context: string
) {
  return useSWR<T>(key, async () => {
    try {
      return await fetcher();
    } catch (err) {
      const errorMessage = handleClientError(err, context);
      console.error(`❌ ${context} failed:`, errorMessage);
      throw new Error(errorMessage);
    }
  });
} 