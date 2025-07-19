import React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { TableSearch } from '@components/composed/tables/features/search';
import { Select } from '@components/core/fields/Select';
import { Button } from '@components/core/Button';
import { Text } from '@components/core/typography/Text';
import { cn } from '@ui/utils/formatters';

const filterHeader = tv({
  slots: {
    container: 'bg-white p-6 rounded-lg shadow-sm border mb-6',
    searchSection: 'mb-6',
    filterGrid: 'grid gap-6 items-end',
    filterColumn: 'flex flex-col',
    label: 'mb-2 font-medium',
  },
  variants: {
    columns: {
      1: { filterGrid: 'grid-cols-1' },
      2: { filterGrid: 'grid-cols-1 md:grid-cols-2' },
      3: { filterGrid: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' },
      4: { filterGrid: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' },
      5: { filterGrid: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5' },
    },
    searchPosition: {
      top: { searchSection: 'mb-6' },
      inline: { searchSection: 'mb-0' },
      none: { searchSection: 'hidden' },
    },
  },
  defaultVariants: {
    columns: 3,
    searchPosition: 'top',
  },
});

export type FilterHeaderVariants = VariantProps<typeof filterHeader>;

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface FilterHeaderProps extends FilterHeaderVariants {
  // Search configuration
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  
  // Filter configuration
  filters: FilterConfig[];
  
  // Clear filters
  onClearFilters?: () => void;
  clearFiltersLabel?: string;
  
  // Layout
  className?: string;
}

export function FilterHeader({
  // Search props
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  
  // Filter props
  filters,
  
  // Clear filters
  onClearFilters,
  clearFiltersLabel = 'Clear Filters',
  
  // Layout props
  columns,
  searchPosition = 'top',
  className,
}: FilterHeaderProps) {
  const styles = filterHeader({ columns, searchPosition });
  
  // Calculate grid columns including clear button if provided
  const totalColumns = filters.length + (onClearFilters ? 1 : 0);
  const effectiveColumns = Math.min(totalColumns, columns || 3) as FilterHeaderVariants['columns'];
  const gridStyles = filterHeader({ columns: effectiveColumns, searchPosition });

  return (
    <div className={cn(styles.container(), className)}>
      {/* Search Bar */}
      {searchPosition !== 'none' && onSearchChange && (
        <div className={styles.searchSection()}>
          <Text textSize="sm" className={styles.label()}>
            Search
          </Text>
          <TableSearch
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full max-w-md"
            textSize="sm"
            padding="sm"
          />
        </div>
      )}
      
      {/* Filter Controls */}
      <div className={gridStyles.filterGrid()}>
        {filters.map((filter) => (
          <div key={filter.key} className={styles.filterColumn()}>
            <Text textSize="sm" className={styles.label()}>
              {filter.label}
            </Text>
            <Select
              options={filter.options}
              value={filter.value}
              onChange={filter.onChange}
              placeholder={filter.placeholder}
              className="w-full"
            />
          </div>
        ))}
        
        {/* Clear Filters Button */}
        {onClearFilters && (
          <div className={styles.filterColumn()}>
            <Button
              intent="secondary"
              appearance="outline"
              onClick={onClearFilters}
              className="w-full"
            >
              {clearFiltersLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 