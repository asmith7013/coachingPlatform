import React, { useState, useEffect, useMemo } from "react";
// import { Button } from '@components/core/Button';
import { Input } from '@components/core/fields/Input';
import { Select } from '@components/core/fields/Select';
// import { Text } from '@components/core/typography/Text';
import { Card } from '@components/composed/cards/Card';
import { Pagination } from '@components/core/navigation/Pagination';

import { cn } from "@ui/utils/formatters";
import debounce from 'lodash.debounce';

interface ResourceHeaderProps<T> {
  page: number;
  total: number;
  limit: number;
  setPage: (page: number) => void;
  sortOptions: { key: keyof T | string; label: string }[];
  onSort: (field: keyof T | string, order: "asc" | "desc") => void;
  onSearch: (value: string) => void;
  searchInput: string;
  setSearchInput: (value: string) => void;
  performanceMode?: boolean;
  togglePerformanceMode?: () => void;
}

export function ResourceHeader<T extends Record<string, unknown>>({
  page,
  total,
  limit,
  setPage,
  sortOptions,
  onSort,
  onSearch,
  searchInput,
  setSearchInput,
}: ResourceHeaderProps<T>) {
  const [sortValue, setSortValue] = useState<string>("");

  // Create debounced search function
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      onSearch(value);
    }, 300),
    [onSearch]
  );

  // Call debounced search when input changes
  useEffect(() => {
    debouncedSearch(searchInput);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchInput, debouncedSearch]);

  return (
    <Card 
      padding="md"
      className={cn('bg-surface', 'border-outline')}
    >
      {/* Pagination Controls */}
      <Pagination
        currentPage={page}
        totalPages={Math.ceil(total / limit)}
        onPageChange={setPage}
      />

      {/* Sort and Search Controls */}
      <div className="flex items-center gap-4">
        {/* Sort Dropdown */}
        <Select
          value={sortValue}
          onChange={(value) => {
            setSortValue(value);
            const [field, order] = value.split(':');
            onSort(field as keyof T | string, order as 'asc' | 'desc');
          }}
          options={sortOptions.flatMap(option => [
            { value: `${String(option.key)}:asc`, label: `Sort ${option.label} A-Z` },
            { value: `${String(option.key)}:desc`, label: `Sort ${option.label} Z-A` }
          ])}
          placeholder="Sort by..."
          textSize="base"
          padding="md"
          radius="md"
          className="min-w-[12rem]"
        />

        {/* Search Input */}
        <Input
          type="text"
          placeholder="Search..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          textSize="base"
          padding="md"
        />

        {/* Performance Mode Toggle */}
        {/* {togglePerformanceMode && (
          <Button
            onClick={togglePerformanceMode}
            variant={performanceMode ? "success" : "secondary"}
            textSize="sm"
            padding="sm"
          >
            {performanceMode ? '🚀 Performance Mode' : '🔍 Detailed Mode'}
          </Button>
        )} */}
      </div>
    </Card>
  );
}
