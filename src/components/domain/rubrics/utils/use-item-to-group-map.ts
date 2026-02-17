"use client";

import { useMemo } from "react";

export type ItemWithId = {
  id: string;
};

export type GroupWithId = {
  id: string;
};

export function useItemToGroupMap<
  TGroup extends GroupWithId,
  TItem extends ItemWithId,
>(
  groups: TGroup[],
  extractItems: (group: TGroup) => TItem[],
): Map<string, string[]> {
  return useMemo(() => {
    const itemToGroupMap = new Map<string, string[]>();

    groups.forEach((group) => {
      const items = extractItems(group);
      items.forEach((item) => {
        const groupIds = itemToGroupMap.get(item.id) || [];
        if (!groupIds.includes(group.id)) {
          itemToGroupMap.set(item.id, [...groupIds, group.id]);
        }
      });
    });

    return itemToGroupMap;
  }, [groups, extractItems]);
}
