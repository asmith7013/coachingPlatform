# TanStack Table Implementation

## Overview

This document outlines the implementation of TanStack Table functionality in the AI Coaching Platform, following established patterns and providing a unified approach to data visualization.

## Architecture

### Core Components

#### 1. TanStackTable Component
**Location**: `src/components/composed/tables/tanstack/TanStackTable.tsx`

The main component that provides:
- **Sorting**: Click column headers to sort data
- **Filtering**: Global search across all columns
- **Pagination**: Built-in pagination with controls
- **Custom Cell Rendering**: Flexible cell content with design system integration
- **Row Interactions**: Click handlers for row selection
- **Loading States**: Built-in loading and empty state handling
- **Responsive Design**: Mobile-friendly layouts
- **Accessibility**: Keyboard navigation and screen reader support

#### 2. Component Variants

```typescript
// Basic usage
<TanStackTable data={data} columns={columns} />

// Searchable table
<TanStackTable data={data} columns={columns} searchable />

// Paginated table
<TanStackTable 
  data={data} 
  columns={columns} 
  paginated 
  pageSize={10}
  searchable 
/>

// Compact table with interactions
<TanStackTable 
  data={data} 
  columns={columns} 
  size="sm"
  striped
  onRowClick={(row) => handleRowClick(row)}
/>
```

### Design System Integration

#### Styling Architecture
- **Tailwind Variants**: Uses `tailwind-variants` for consistent styling
- **Token System**: Integrates with existing design tokens
- **Component Slots**: Modular styling approach for different table parts
- **Responsive Design**: Mobile-first responsive layouts

#### Style Variants
```typescript
interface TanStackTableVariants {
  size?: 'sm' | 'md' | 'lg'
  striped?: boolean
}
```

### Column Configuration

#### Basic Column Definition
```typescript
const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: 'fieldName',
    header: 'Display Name',
    cell: ({ getValue }) => (
      <TableCell variant="default">
        {String(getValue())}
      </TableCell>
    ),
    enableSorting: true,
    enableColumnFilter: true,
  }
]
```

#### Advanced Cell Rendering
```typescript
{
  accessorKey: 'status',
  header: 'Status',
  cell: ({ getValue }) => {
    const status = getValue() as 'completed' | 'pending' | 'failed'
    return (
      <TableCell variant={status === 'completed' ? 'default' : 'danger'}>
        <span className={`px-2 py-1 rounded-full text-xs ${
          status === 'completed' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {status}
        </span>
      </TableCell>
    )
  },
}
```

## Implementation Examples

### 1. Simple Static Data Table

**File**: `src/app/examples/tanstack-simple/page.tsx`

```typescript
interface Student {
  id: string
  name: string
  grade: number
  subject: string
  score: number
  status: 'completed' | 'in-progress' | 'not-started'
}

const columns: ColumnDef<Student>[] = [
  {
    accessorKey: 'name',
    header: 'Student Name',
    cell: ({ getValue }) => (
      <TableCell variant="default">
        <span className="font-medium">{String(getValue())}</span>
      </TableCell>
    ),
  },
  // ... more columns
]

export default function ExamplePage() {
  return (
    <TanStackTable
      data={studentData}
      columns={columns}
      searchable
      paginated
      pageSize={10}
    />
  )
}
```

### 2. Real Data Integration

**File**: `src/app/examples/tanstack-table/page.tsx`

Integration with existing 313 analytics data:

```typescript
import { useZearnData, useSnorklData } from '@hooks/domain/313/useAnalytics'
import { ZearnCompletion, SnorklCompletion } from '@zod-schema/scm/core'

export default function AnalyticsTablePage() {
  const { data: zearnData, isLoading } = useZearnData()
  
  return (
    <TanStackTable
      data={zearnData || []}
      columns={zearnColumns}
      loading={isLoading}
      searchable
      paginated
      onRowClick={(row) => handleRowSelection(row)}
    />
  )
}
```

## Key Features

### 1. Sorting
- Click any column header to sort
- Visual indicators for sort direction (↑ ↓ ↕)
- Multi-column sorting support
- Custom sort functions for complex data types

### 2. Filtering & Search
- Global search across all columns
- Column-specific filters
- Real-time filtering as user types
- Debounced search for performance

### 3. Pagination
- Configurable page sizes
- Navigation controls (First, Previous, Next, Last)
- Page information display
- URL-based pagination support

### 4. Custom Cell Rendering
- Rich content in cells (badges, icons, formatted text)
- Conditional styling based on data values
- Integration with design system components
- Accessibility-friendly markup

### 5. Row Interactions
- Click handlers for row selection
- Hover states and visual feedback
- Keyboard navigation support
- Custom action buttons in rows

### 6. Loading & Empty States
- Built-in loading spinner
- Customizable empty state messages
- Error state handling
- Skeleton loading patterns

## Performance Considerations

### 1. Data Optimization
- Memoized column definitions
- Efficient re-rendering with React.memo
- Virtual scrolling for large datasets (future enhancement)
- Debounced search inputs

### 2. Bundle Size
- Tree-shakeable imports
- Only imports needed TanStack features
- Minimal additional dependencies
- Leverages existing design system

## Integration Patterns

### 1. With Existing Analytics Hooks
```typescript
const { data, isLoading, error } = useAnalyticsData()

<TanStackTable
  data={data || []}
  columns={columns}
  loading={isLoading}
  emptyMessage={error ? 'Error loading data' : 'No data available'}
/>
```

### 2. With Form Libraries
```typescript
// Future enhancement with TanStack Form
const { form } = useForm()

<TanStackTable
  data={data}
  columns={columns}
  onRowClick={(row) => form.setValues(row)}
/>
```

### 3. With State Management
```typescript
// Integration with existing state patterns
const [selectedRows, setSelectedRows] = useState<string[]>([])

<TanStackTable
  data={data}
  columns={columns}
  onRowClick={(row) => {
    setSelectedRows(prev => 
      prev.includes(row.id) 
        ? prev.filter(id => id !== row.id)
        : [...prev, row.id]
    )
  }}
/>
```

## Best Practices

### 1. Column Definition
- Define columns outside component to prevent re-renders
- Use meaningful header names
- Implement proper cell variants for data types
- Add sorting/filtering configuration

### 2. Performance
- Memoize column definitions with useMemo
- Use React.memo for table components
- Implement proper loading states
- Consider pagination for large datasets

### 3. Accessibility
- Use semantic HTML in cell content
- Provide meaningful empty state messages
- Ensure keyboard navigation works
- Test with screen readers

### 4. Styling
- Use design system tokens consistently
- Implement proper responsive behavior
- Follow established variant patterns
- Maintain visual hierarchy

## Future Enhancements

### 1. Schema-Driven Tables
- Automatic column generation from Zod schemas
- Type-safe configuration
- Consistent formatting across tables

### 2. Advanced Features
- Column resizing and reordering
- Virtual scrolling for performance
- Export functionality (CSV, PDF)
- Advanced filtering UI

### 3. Form Integration
- Inline editing capabilities
- Validation integration
- Bulk operations
- CRUD interfaces

## Migration Guide

### From Existing Table Component

1. **Import TanStack Table**:
   ```typescript
   import { TanStackTable } from '@/components/composed/tables/tanstack/TanStackTable'
   ```

2. **Convert Column Configuration**:
   ```typescript
   // Old format
   const columns = [
     { id: 'name', label: 'Name', accessor: (row) => row.name }
   ]
   
   // New format
   const columns: ColumnDef<DataType>[] = [
     {
       accessorKey: 'name',
       header: 'Name',
       cell: ({ getValue }) => <TableCell>{String(getValue())}</TableCell>
     }
   ]
   ```

3. **Update Component Usage**:
   ```typescript
   // Old
   <Table data={data} columns={columns} />
   
   // New
   <TanStackTable data={data} columns={columns} />
   ```

## Conclusion

The TanStack Table implementation provides a powerful, flexible, and performant solution for data visualization in the AI Coaching Platform. It maintains consistency with existing patterns while adding advanced functionality for sorting, filtering, pagination, and custom rendering.

The implementation follows the platform's architectural principles:
- **Modular Design**: Reusable components with clear interfaces
- **Design System Integration**: Consistent styling and tokens
- **Type Safety**: Full TypeScript support
- **Performance**: Optimized for large datasets
- **Accessibility**: WCAG compliant implementation

This foundation supports current needs while providing a path for future enhancements and integrations. 