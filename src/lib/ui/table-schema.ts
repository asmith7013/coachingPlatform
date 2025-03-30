export interface TableColumnSchema<T> {
  id: string
  label: string
  accessor: (row: T) => React.ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  width?: string
}

export function createTableSchema<T>(
  columns: Array<{
    id: string
    label: string
    accessor: (row: T) => React.ReactNode
    align?: 'left' | 'center' | 'right'
    sortable?: boolean
    width?: string
    className?: string
  }>
): TableColumnSchema<T>[] {
  return columns.map((col) => ({
    ...col,
    className: col.className ?? '', // fallback
  }))
} 