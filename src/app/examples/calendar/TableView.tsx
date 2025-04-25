import React from 'react';
import { Visit } from './types';
import { formatDate, parseISO } from './utils';

type TableViewProps = {
  visits: Visit[];
};

const TableView: React.FC<TableViewProps> = ({ visits }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPM</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coach</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {visits
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((visit) => (
            <tr key={visit.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{visit.sessionName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-800">
                  {visit.cpm}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800">
                  {visit.coach}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="inline-flex text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  {visit.type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="inline-flex text-xs font-medium px-3 py-2 rounded-full bg-orange-100 text-orange-800">
                  {formatDate(parseISO(visit.date), 'MMM d, yyyy')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`inline-flex text-xs font-medium px-3 py-2 rounded-full ${
                  visit.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  visit.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {visit.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`inline-flex text-xs font-medium px-3 py-2 rounded-full ${
                  visit.delivery === 'In Person' ? 'bg-emerald-100 text-emerald-800' :
                  visit.delivery === 'Virtual' ? 'bg-purple-100 text-purple-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {visit.delivery}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {visits.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          No coaching sessions scheduled for this month.
        </div>
      )}
    </div>
  );
};

export default TableView; 