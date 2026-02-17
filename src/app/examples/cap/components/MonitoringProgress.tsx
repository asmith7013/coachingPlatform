import React from "react";

interface MonitoringProgressProps {
  metrics: Array<{
    name: string;
    scores: (number | null)[];
  }>;
  dates: string[];
  evidence: string[];
}

export const MonitoringProgress: React.FC<MonitoringProgressProps> = ({
  metrics,
  dates,
  evidence,
}) => {
  return (
    <div className="mb-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 mb-4">
          <thead>
            <tr>
              <th className="w-1/4 px-3 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                Metric
              </th>
              {dates.map((date, idx) => (
                <th
                  key={idx}
                  className="px-3 py-2 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                >
                  {date}
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
            <tr>
              <td className="px-3 py-2 whitespace-normal border-r border-gray-200 font-semibold">
                Evidence Links
              </td>
              {dates.map((_, dateIdx) => (
                <td
                  key={dateIdx}
                  className="px-3 py-2 text-center border-r border-gray-200 last:border-r-0"
                >
                  {evidence[dateIdx] ? (
                    <a
                      href={evidence[dateIdx]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-700 mb-2">Progress Summary</h4>
        <p className="text-blue-800">
          This data shows the progression over time against each metric. The
          evidence links provide documentation or artifacts that support the
          scores shown for each date.
        </p>
      </div>
    </div>
  );
};
