import { createTableSchema } from '../table-schema'
import type { TableColumnSchema } from '../table-schema'
import type { School } from '@/lib/data/schemas/core/school'

export const schoolTableSchema: TableColumnSchema<School>[] = createTableSchema<School>([
//   {
//     id: 'name',
//     label: 'School Name',
//     accessor: (s) => s.name,
//     sortable: true,
//   },
//   {
//     id: 'borough',
//     label: 'Borough',
//     accessor: (s) => s.borough,
//     sortable: true,
//     align: 'center',
//   },
//   {
//     id: 'district',
//     label: 'District',
//     accessor: (s) => s.district,
//     align: 'right',
//   },
]) 