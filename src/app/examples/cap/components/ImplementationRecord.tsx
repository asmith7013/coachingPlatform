import React from "react";

interface ImplementationRecordItem {
  date: string;
  moveSelected: string;
  teacherActions: string;
  studentOutcomes: string;
  nextStep: string;
}

interface ImplementationRecordProps {
  records: ImplementationRecordItem[];
  dates: string[];
}

export const ImplementationRecord: React.FC<ImplementationRecordProps> = ({
  records,
  dates,
}) => {
  return (
    <div className="mt-6">
      <h3 className="font-semibold text-lg mb-2">
        Implementation Record / Decision Log
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead>
            <tr>
              <th className="px-3 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                Date
              </th>
              <th className="px-3 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                Coaching Move/Tool Selected
              </th>
              <th className="px-3 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                Teacher Action/Reflection
              </th>
              <th className="px-3 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                Student Outcomes
              </th>
              <th className="px-3 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Steps
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record, idx) => (
              <tr key={idx}>
                <td className="px-3 py-2 whitespace-nowrap border-r border-gray-200">
                  {record.date}
                </td>
                <td className="px-3 py-2 whitespace-normal border-r border-gray-200">
                  {record.moveSelected}
                </td>
                <td className="px-3 py-2 whitespace-normal border-r border-gray-200">
                  {record.teacherActions}
                </td>
                <td className="px-3 py-2 whitespace-normal border-r border-gray-200">
                  {record.studentOutcomes}
                </td>
                <td className="px-3 py-2 whitespace-normal">
                  {record.nextStep}
                </td>
              </tr>
            ))}
            {/* Empty rows for future entries */}
            {dates.length > records.length &&
              dates.slice(records.length).map((_, idx) => (
                <tr key={`empty-${idx}`}>
                  <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200"></td>
                  <td className="px-3 py-3 whitespace-normal border-r border-gray-200"></td>
                  <td className="px-3 py-3 whitespace-normal border-r border-gray-200"></td>
                  <td className="px-3 py-3 whitespace-normal border-r border-gray-200"></td>
                  <td className="px-3 py-3 whitespace-normal"></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
