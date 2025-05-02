import React from 'react';

interface CoachingMove {
  category: string;
  moves: string[];
  tools: string[];
}

interface CoachingMovesTableProps {
  moves: CoachingMove[];
}

export const CoachingMovesTable: React.FC<CoachingMovesTableProps> = ({ moves }) => {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
        <thead>
          <tr>
            <th className="w-1/3 px-3 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
              Category
            </th>
            <th className="w-1/3 px-3 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
              Coaching Moves
            </th>
            <th className="w-1/3 px-3 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tools/Resources
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {moves.map((move, idx) => (
            <tr key={idx}>
              <td className="px-3 py-2 whitespace-normal border-r border-gray-200 align-top">
                {move.category}
              </td>
              <td className="px-3 py-2 whitespace-normal border-r border-gray-200">
                <ul className="list-disc pl-5 space-y-1">
                  {move.moves.map((item, itemIdx) => (
                    <li key={itemIdx}>{item}</li>
                  ))}
                </ul>
              </td>
              <td className="px-3 py-2 whitespace-normal">
                <ul className="list-disc pl-5 space-y-1">
                  {move.tools.map((tool, toolIdx) => (
                    <li key={toolIdx}>{tool}</li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 