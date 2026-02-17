import React from "react";
import { Visit } from "./types";
import { formatDate, parseISO } from "./utils";

type ListViewProps = {
  visits: Visit[];
  cycles: Record<string, { date: string; label: string }[]>;
};

const ListView: React.FC<ListViewProps> = ({ visits, cycles }) => {
  // Sort visits by date
  const sortedVisits = [...visits].sort((a, b) => a.date.localeCompare(b.date));

  // Helper function to determine which cycle a visit belongs to and return styling
  const getCycleInfo = (visit: Visit): { name: string; className: string } => {
    // Initial or final walkthrough detection (based on session name)
    if (visit.sessionName.toLowerCase().includes("initial walkthrough")) {
      return {
        name: "Initial Walkthrough",
        className:
          "text-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800/30",
      };
    }

    if (visit.sessionName.toLowerCase().includes("final walkthrough")) {
      return {
        name: "Final Walkthrough",
        className:
          "text-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800/30",
      };
    }

    // Check if date is in Fall/Winter Cycle
    const visitDate = visit.date;
    for (const cycleDate of cycles["Winter Cycle"]) {
      if (cycleDate.date === visitDate) {
        return {
          name: "Fall Cycle",
          className:
            "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30",
        };
      }
    }

    // Check if date is in Spring Cycle
    for (const cycleDate of cycles["Spring Cycle"]) {
      if (cycleDate.date === visitDate) {
        return {
          name: "Spring Cycle",
          className:
            "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30",
        };
      }
    }

    // If no explicit cycle match found, determine based on date
    const visitDateObj = parseISO(visitDate);
    const month = visitDateObj.getMonth();

    // Assume Fall is Aug-Dec (7-11), Spring is Jan-Jun (0-5)
    if (month >= 7 && month <= 11) {
      return {
        name: "Fall Cycle",
        className:
          "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30",
      };
    } else {
      return {
        name: "Spring Cycle",
        className:
          "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30",
      };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Item
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cycle
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedVisits.map((visit) => {
            const cycleInfo = getCycleInfo(visit);

            return (
              <tr key={visit.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {visit.sessionName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="inline-flex text-xs font-medium px-3 py-2 rounded-full bg-orange-100 text-orange-800">
                    {formatDate(parseISO(visit.date), "MMM d, yyyy")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span
                    className={`inline-flex text-xs font-medium px-3 py-2 rounded-full ${cycleInfo.className}`}
                  >
                    {cycleInfo.name}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {sortedVisits.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          No coaching sessions scheduled for this school year.
        </div>
      )}
    </div>
  );
};

export default ListView;
