import { useSWRConfig } from "swr";

/**
 * SWR Hook for handling optimistic UI updates with array-based cache keys.
 * @param key - The SWR cache key for the dataset (e.g., ["lookFors", page, limit, filters, sortBy]).
 */
export function useOptimisticUpdate<T extends { _id?: string }>() {
    const { mutate } = useSWRConfig(); // ✅ Get SWR's mutate function


    const optimisticAdd = async (
        newItem: Omit<T, "_id">,
        apiCall: (item: Omit<T, "_id">) => Promise<{ success: boolean; [key: string]: unknown }>,
        cacheKey: unknown[],
        resultKey: string
      ) => {
        const tempId = `temp-${Date.now()}`;
        const optimisticItem = { _id: tempId, ...newItem } as T;
      
        await mutate(
          cacheKey,
          async (currentData: T[] = []) => [optimisticItem, ...currentData],
          false
        );
      
        try {
          const result = await apiCall(newItem);
          const createdItem = result[resultKey] as T;
          await mutate(
            cacheKey,
            async (currentData: T[] = []) =>
              currentData.map((item) => (item._id === tempId ? createdItem : item)),
            false
          );
        } catch (err) {
          console.error("❌ Error adding item:", err);
          await mutate(cacheKey); // rollback
        }
    };
    /**
     * Optimistically add an item.
     */
    // const optimisticAdd = async (
    //     newItem: Omit<T, "_id">,
    //     apiCall: (item: Omit<T, "_id">) => Promise<T>,
    //     cacheKey: unknown[],
    //     resultKey: string
    // ) => {


    //     // console.log("🔍 newItem inside optimisticAdd", newItem);
    //     const tempId = `temp-${Date.now()}`;
    //     const optimisticItem = { _id: tempId, ...newItem } as T;
    //     // console.log("🔍 optimisticItem", optimisticItem, "newItem", newItem, "tempId", tempId);
    //     // console.log("🔍 cacheKey inside optimisticAdd", cacheKey);
    //     await mutate(
    //         cacheKey,
    //         async (currentData: T[] = []) => [optimisticItem, ...currentData], // ✅ Optimistic update
    //         false
    //     );

    //     try {
    //         const createdItem = await apiCall(newItem);
    //         // console.log("🔍 createdItem", createdItem);
    //         await mutate(
    //             cacheKey,
    //             async (currentData: T[] = []) =>
    //                 currentData.map((item) =>
    //                     item._id === tempId ? createdItem : item
    //                 ),
    //             false
    //         ); // ✅ Replace temp with real data
    //         // console.log("🔍 mutated cacheKey inside optimisticAdd", cacheKey);
    //     } catch (err) {
    //         console.error("❌ Error adding item:", err);
    //         await mutate(cacheKey); // ❌ Rollback
    //     }
    // };

    const optimisticModify = async (
        id: string,
        updatedData: Partial<T>,
        apiCall: (id: string, data: Partial<T>) => Promise<{ success: boolean; [key: string]: unknown }>,
        cacheKey: unknown[],
        resultKey: string
      ) => {
        await mutate(
          cacheKey,
          async (currentData: T[] = []) =>
            currentData.map((item) =>
              item._id === id ? { ...item, ...updatedData } : item
            ),
          false
        );
      
        try {
          const result = await apiCall(id, updatedData);
          const updatedItem = result[resultKey] as T;
      
          await mutate(
            cacheKey,
            async (currentData: T[] = []) =>
              currentData.map((item) =>
                item._id === id ? updatedItem : item
              ),
            false
          );
        } catch (err) {
          console.error("❌ Error updating item:", err);
          await mutate(cacheKey); // rollback
        }
      };
      
    /**
     * Optimistically modify an item.
     */
    // const optimisticModify = async (
    //     id: string,
    //     updatedData: Partial<T>,
    //     apiCall: (id: string, data: Partial<T>) => Promise<T>,
    //     cacheKey: unknown[],
    //     resultKey: string
    // ) => {
    //     await mutate(
    //         cacheKey,
    //         async (currentData: T[] = []) =>
    //             currentData.map((item) =>
    //                 item._id === id ? { ...item, ...updatedData } : item
    //             ),
    //         false
    //     ); // ✅ Optimistically update UI

    //     try {
    //         const updatedItem = await apiCall(id, updatedData);
    //         await mutate(
    //             cacheKey,
    //             async (currentData: T[] = []) =>
    //                 currentData.map((item) =>
    //                     item._id === id ? updatedItem : item
    //                 ),
    //             false
    //         ); // ✅ Confirm API update
    //     } catch (err) {
    //         console.error("❌ Error updating item:", err);
    //         await mutate(cacheKey); // ❌ Rollback
    //     }
    // };

    /**
     * Optimistically remove an item.
     */
    const optimisticRemove = async (
        id: string,
        // apiCall: (id: string) => Promise<void>,
        apiCall: (id: string) => Promise<{ success: boolean; error?: string }>,
        cacheKey: unknown[]
    ) => {
        await mutate(
            cacheKey,
            async (currentData: T[] = []) =>
                currentData.filter((item) => item._id !== id),
            false
        ); // ✅ Optimistically remove item from UI

        try {
            await apiCall(id);
        } catch (err) {
            console.error("❌ Error deleting item:", err);
            await mutate(cacheKey); // ❌ Rollback
        }
    };

    return { optimisticAdd, optimisticModify, optimisticRemove };
}