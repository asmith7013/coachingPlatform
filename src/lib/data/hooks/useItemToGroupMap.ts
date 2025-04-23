'use client';

import { useMemo } from 'react';

export interface ItemWithId {
  _id: string;
  [key: string]: unknown;
}

export interface GroupWithId {
  _id: string;
  [key: string]: unknown;
}

/**
 * Hook to create a mapping of items to groups
 */
export function useItemToGroupMap<T extends ItemWithId, G extends GroupWithId>(
  items: T[],
  groups: G[],
  groupIdField: keyof T
): Record<string, T[]> {
  return useMemo(() => {
    const map: Record<string, T[]> = {};
    
    // Initialize map with empty arrays for all groups
    groups.forEach(group => {
      map[group._id] = [];
    });
    
    // Add items to their respective groups
    items.forEach(item => {
      const groupId = item[groupIdField] as unknown as string;
      if (groupId && map[groupId]) {
        map[groupId].push(item);
      }
    });
    
    return map;
  }, [items, groups, groupIdField]);
} 