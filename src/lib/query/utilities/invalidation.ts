// src/lib/query/utilities/invalidation.ts
import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/queryKeys';

export function createInvalidationHelper(queryClient: QueryClient) {
  return {
    invalidateEntity: (entityType: string, id?: string) => {
      if (id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.entities.detail(entityType, id) 
        });
      }
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.entities.list(entityType) 
      });
    },
    
    invalidateList: (entityType: string) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.entities.lists() 
      });
    },
    
    invalidateAll: () => {
      queryClient.invalidateQueries();
    }
  };
}