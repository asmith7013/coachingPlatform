import React from "react";

interface ResourceHeaderProps<T> {
  page: number;
  total: number;
  limit: number;
  setPage: (page: number) => void;
  sortOptions: { key: keyof T | string; label: string }[];
  onSort: (field: keyof T | string, order: "asc" | "desc") => void;
  onSearch: (value: string) => void;
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
  // performanceMode,
  // togglePerformanceMode,
}: ResourceHeaderProps<T>) {
  return (
    <div className="flex justify-between items-center mb-4">
      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        <button 
          disabled={page === 1} 
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          ⬅️ Previous
        </button>
        <span>Page {page} of {Math.ceil(total / limit)}</span>
        <button 
          disabled={page * limit >= total} 
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next ➡️
        </button>
      </div>

      {/* Sort and Search Controls */}
      <div className="flex items-center gap-4">
        {/* Sort Dropdown */}
        <select
          onChange={(e) => {
            const [field, order] = e.target.value.split(":");
            onSort(field as keyof T | string, order as "asc" | "desc");
          }}
          className="px-3 py-1 border rounded-md"
        >
          {sortOptions.map((option) => (
            <React.Fragment key={String(option.key)}>
              <option value={`${String(option.key)}:asc`}>Sort {option.label} A-Z</option>
              <option value={`${String(option.key)}:desc`}>Sort {option.label} Z-A</option>
            </React.Fragment>
          ))}
        </select>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => onSearch(e.target.value)}
          className="border px-3 py-1 rounded-md"
        />

        {/* Performance Mode Toggle */}
        {/* {togglePerformanceMode && (
          <button
            onClick={togglePerformanceMode}
            className={`px-3 py-1 rounded ${performanceMode ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
          >
            {performanceMode ? '🚀 Performance Mode' : '🔍 Detailed Mode'}
          </button>
        )} */}
      </div>
    </div>
  );
}
