'use client'

import React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  PaginationState,
} from '@tanstack/react-table'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@ui/utils/formatters'
import { Button } from '@/components/core/Button'
import { Input } from '@/components/core/fields/Input'

// ===== STYLING =====

const tanStackTable = tv({
  slots: {
    container: 'w-full',
    wrapper: 'w-full overflow-auto',
    table: 'min-w-full divide-y border-surface',
    thead: 'bg-surface-muted',
    tbody: 'divide-y divide-surface bg-white',
    th: 'px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider',
    td: 'px-6 py-4 text-sm text-text',
    sortButton: 'inline-flex items-center gap-1 hover:text-primary cursor-pointer',
    pagination: 'flex items-center justify-between px-4 py-3 bg-surface-light border-t',
    paginationInfo: 'text-sm text-text-muted',
    paginationControls: 'flex items-center gap-2',
    searchContainer: 'mb-4',
    searchInput: 'max-w-sm',
    emptyState: 'px-6 py-12 text-center',
    emptyText: 'text-text-muted'
  },
  variants: {
    size: {
      sm: {
        th: 'px-3 py-2 text-xs',
        td: 'px-3 py-2 text-xs'
      },
      md: {
        th: 'px-4 py-3 text-sm',
        td: 'px-4 py-3 text-sm'
      },
      lg: {
        th: 'px-6 py-4 text-base',
        td: 'px-6 py-4 text-base'
      }
    },
    striped: {
      true: {
        tbody: 'divide-y divide-surface bg-white [&>tr:nth-child(even)]:bg-surface-light'
      }
    }
  },
  defaultVariants: {
    size: 'md',
    striped: false
  }
})

export type TanStackTableVariants = VariantProps<typeof tanStackTable>

// ===== TYPES =====

export interface TanStackTableProps<T> extends TanStackTableVariants {
  data: T[]
  columns: ColumnDef<T>[]
  className?: string
  onRowClick?: (row: T) => void
  searchable?: boolean
  searchPlaceholder?: string
  paginated?: boolean
  pageSize?: number
  emptyMessage?: string
  loading?: boolean
  enableSorting?: boolean
  enableFiltering?: boolean
  enableColumnResizing?: boolean
}

// ===== COMPONENT =====

export function TanStackTable<T>({
  data,
  columns,
  className,
  onRowClick,
  searchable = false,
  searchPlaceholder = 'Search...',
  paginated = false,
  pageSize = 10,
  emptyMessage = 'No data available',
  loading = false,
  enableSorting = true,
  enableFiltering = true,
  enableColumnResizing = false,
  size = 'md',
  striped = false,
  ...props
}: TanStackTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: paginated ? getPaginationRowModel() : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableColumnResizing,
  })

  const styles = tanStackTable({ size, striped })

  if (loading) {
    return (
      <div className={cn(styles.container(), className)}>
        <div className={styles.emptyState()}>
          <div className={styles.emptyText()}>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(styles.container(), className)} {...props}>
      {/* Search */}
      {searchable && (
        <div className={styles.searchContainer()}>
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className={styles.searchInput()}
          />
        </div>
      )}

      {/* Table */}
      <div className={styles.wrapper()}>
        <table className={styles.table()}>
          <thead className={styles.thead()}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      styles.th(),
                      header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      width: header.getSize() !== 150 ? header.getSize() : undefined,
                    }}
                  >
                    <div className={styles.sortButton()}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getCanSort() && (
                        <span className="ml-1">
                          {{
                            asc: '↑',
                            desc: '↓',
                          }[header.column.getIsSorted() as string] ?? '↕'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className={styles.tbody()}>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyState()}>
                  <div className={styles.emptyText()}>{emptyMessage}</div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={onRowClick ? 'cursor-pointer hover:bg-surface-hover' : ''}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="whitespace-nowrap">
                      <div className={styles.td()}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginated && table.getPageCount() > 1 && (
        <div className={styles.pagination()}>
          <div className={styles.paginationInfo()}>
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            of {table.getFilteredRowModel().rows.length} results
          </div>
          <div className={styles.paginationControls()}>
            <Button
              appearance="outline"
              textSize="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              First
            </Button>
            <Button
              appearance="outline"
              textSize="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button
              appearance="outline"
              textSize="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
            <Button
              appearance="outline"
              textSize="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ===== CONVENIENCE COMPONENTS =====

/**
 * Pre-configured compact table
 */
export function CompactTanStackTable<T>(props: TanStackTableProps<T>) {
  return <TanStackTable {...props} size="sm" striped />
}

/**
 * Pre-configured searchable table
 */
export function SearchableTanStackTable<T>(props: TanStackTableProps<T>) {
  return <TanStackTable {...props} searchable />
}

/**
 * Pre-configured paginated table
 */
export function PaginatedTanStackTable<T>(props: TanStackTableProps<T>) {
  return <TanStackTable {...props} paginated searchable />
} 