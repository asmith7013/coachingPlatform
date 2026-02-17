import React from "react";

interface MetricsTableProps {
  metrics: Array<{
    name: string;
    scores: (number | null)[];
  }>;
  dates: string[];
}

export const MetricsTable: React.FC<MetricsTableProps> = ({
  metrics,
  dates,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
        <thead>
          <tr>
            <th className="w-1/3 px-3 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
              Metric
            </th>
            {dates.map((date, idx) => (
              <th
                key={idx}
                className="px-3 py-2 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
              >
                {date || "Date"}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {metrics.map((metric, idx) => (
            <tr key={idx}>
              <td className="px-3 py-2 whitespace-normal border-r border-gray-200">
                {metric.name}
              </td>
              {metric.scores.map((score, scoreIdx) => (
                <td
                  key={scoreIdx}
                  className="px-3 py-2 text-center border-r border-gray-200 last:border-r-0"
                >
                  {score === null ? "—" : score}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
