export interface TableRow {
  input: number;
  output: number | null;
}

export interface DataTableProps {
  data: TableRow[];
  inputLabel: string;
  outputLabel: string;
  highlightRow?: number;
  highlightCell?: { row: number; column: 'input' | 'output' };
  showAllValues?: boolean;
}

export function DataTable({
  data,
  inputLabel,
  outputLabel,
  highlightRow,
  highlightCell,
  showAllValues = false,
}: DataTableProps) {
  return (
    <table className="w-full max-w-2xl mx-auto border-collapse bg-white rounded-lg shadow-lg overflow-hidden">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-4 text-xl font-bold text-gray-800 border-r border-gray-300">
            {inputLabel}
          </th>
          <th className="p-4 text-xl font-bold text-gray-800">
            {outputLabel}
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className={`
              border-t border-gray-300
              ${highlightRow === rowIndex ? 'bg-yellow-100 ring-4 ring-yellow-400' : ''}
            `}
          >
            <td className={`
              p-4 text-2xl text-center border-r border-gray-300
              ${highlightCell?.row === rowIndex && highlightCell.column === 'input'
                ? 'bg-yellow-200 ring-2 ring-yellow-500'
                : ''}
            `}>
              {row.input}
            </td>
            <td className={`
              p-4 text-2xl text-center
              ${highlightCell?.row === rowIndex && highlightCell.column === 'output'
                ? 'bg-yellow-200 ring-2 ring-yellow-500'
                : ''}
            `}>
              {showAllValues || row.output !== null ? row.output : '?'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
