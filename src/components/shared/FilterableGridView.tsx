'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils/general';
import { GroupWithId, ItemWithId, useItemToGroupMap } from '@/lib/hooks/useItemToGroupMap';

export interface FilterableGridViewProps<TGroup extends GroupWithId, TItem extends ItemWithId> {
  groups: TGroup[];
  selectedItems: Set<string>;
  renderItemGroup: (group: TGroup, selectedItems: Set<string>) => ReactNode;
  extractItems: (group: TGroup) => TItem[];
  renderItemInSidebar?: (item: TItem, groupIds: string[]) => ReactNode;
  sidebar?: ReactNode;
  headerCard?: ReactNode;
  emptyState?: ReactNode;
  className?: string;
}

export function FilterableGridView<TGroup extends GroupWithId, TItem extends ItemWithId>({
  groups,
  selectedItems,
  renderItemGroup,
  extractItems,
  renderItemInSidebar,
  sidebar,
  headerCard,
  emptyState,
  className
}: FilterableGridViewProps<TGroup, TItem>) {
  const itemToGroupMap = useItemToGroupMap(groups, extractItems);
  const hasSelectedItems = selectedItems.size > 0;
  const hasGroups = groups.length > 0;

  // Filter groups based on selected items using the itemToGroupMap
  const filteredGroups = hasSelectedItems
    ? groups.filter(group => {
        const items = extractItems(group);
        return items.some(item => selectedItems.has(item.id));
      })
    : groups;

  // Get all unique items for sidebar rendering
  const allItems = React.useMemo(() => {
    const itemSet = new Set<TItem>();
    groups.forEach(group => {
      extractItems(group).forEach(item => {
        if (selectedItems.has(item.id)) {
          itemSet.add(item);
        }
      });
    });
    return Array.from(itemSet);
  }, [groups, extractItems, selectedItems]);

  return (
    <div className={cn('grid grid-cols-[1fr,320px] gap-6', className)}>
      <div className="space-y-6">
        {headerCard}
        {hasGroups ? (
          <div className="space-y-6">
            {filteredGroups.map(group => (
              <div key={group.id}>
                {renderItemGroup(group, selectedItems)}
              </div>
            ))}
          </div>
        ) : (
          emptyState
        )}
      </div>
      <div className="space-y-6">
        {/* Render selected items in sidebar if renderItemInSidebar is provided */}
        {renderItemInSidebar && allItems.length > 0 && (
          <div className="space-y-4">
            {allItems.map(item => {
              const groupIds = itemToGroupMap.get(item.id) || [];
              return (
                <div key={item.id}>
                  {renderItemInSidebar(item, groupIds)}
                </div>
              );
            })}
          </div>
        )}
        {sidebar}
      </div>
    </div>
  );
} 