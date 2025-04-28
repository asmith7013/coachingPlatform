/**
 * Table column configuration
 */
export interface TableColumn<T> {
  /** Unique identifier for the column */
  id: string;
  /** Display label for the column header */
  label: string;
  /** Function to access data for this column */
  accessor: keyof T | ((row: T) => React.ReactNode);
  /** Column width (CSS value) */
  width?: string;
  /** Whether the column can be sorted */
  sortable?: boolean;
  /** Whether the column can be filtered */
  filterable?: boolean;
  /** Whether to hide the column on small screens */
  hideOnMobile?: boolean;
  /** Custom rendering for the cell */
  Cell?: (props: { row: T; value: unknown }) => React.ReactNode;
  /** Custom rendering for the header */
  Header?: () => React.ReactNode;
}

/**
 * Table sorting configuration
 */
export interface TableSorting {
  /** Column ID to sort by */
  id: string;
  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Table pagination configuration
 */
export interface TablePagination {
  /** Current page number */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of items */
  totalItems: number;
}

/**
 * Table filtering configuration
 */
export interface TableFilter {
  /** Column ID to filter */
  id: string;
  /** Filter operator */
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte';
  /** Filter value */
  value: string | number | boolean;
}

/**
 * Table configuration
 */
export interface TableConfig<T> {
  /** Table columns */
  columns: TableColumn<T>[];
  /** Initial sorting */
  initialSort?: TableSorting;
  /** Whether the table has pagination */
  paginated?: boolean;
  /** Default page size */
  defaultPageSize?: number;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Whether to show checkboxes for row selection */
  selectable?: boolean;
  /** Whether to allow multiple row selection */
  multiSelect?: boolean;
  /** Whether to show actions column */
  showActions?: boolean;
  /** Whether to enable row expansion */
  expandable?: boolean;
  /** Custom row expansion renderer */
  renderExpanded?: (row: T) => React.ReactNode;
}

/**
 * Table state
 */
export interface TableState {
  /** Selected row IDs */
  selectedRowIds: Record<string, boolean>;
  /** Current sorting */
  sorting: TableSorting[];
  /** Current pagination */
  pagination: TablePagination;
  /** Current filters */
  filters: TableFilter[];
  /** Expanded row IDs */
  expandedRowIds: Record<string, boolean>;
} 