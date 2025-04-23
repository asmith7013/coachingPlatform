import { useMemo } from 'react';

export interface ItemWithId {
  _id: string;
  [key: string]: unknown;
}

export interface GroupWithId {
  _id: string;
  [key: string]: unknown;
}

export function useItemToGroupMap<T extends ItemWithId, G extends GroupWithId>(
  items: T[],
  groupIdField: keyof T,
  groups: G[]
) {
  const groupMap = useMemo(() => {
    const map = new Map<string, T[]>();
    
    // Initialize map with empty arrays for all groups
    groups.forEach(group => {
      map.set(group._id, []);
    });
    
    // Add items to their respective groups
    items.forEach(item => {
      const groupId = item[groupIdField];
      
      if (Array.isArray(groupId)) {
        // Handle arrays of group IDs
        groupId.forEach((id: string) => {
          const currentItems = map.get(id) || [];
          map.set(id, [...currentItems, item]);
        });
      } else if (typeof groupId === 'string') {
        // Handle single group ID
        const currentItems = map.get(groupId) || [];
        map.set(groupId, [...currentItems, item]);
      }
    });
    
    return map;
  }, [items, groupIdField, groups]);
  
  return groupMap;
} 