export interface TableColumnSchema<T> {
  id: string
  label: string
  accessor: (row: T) => React.ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  width?: string
}