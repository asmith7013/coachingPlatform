'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Table } from '@/components/composed/tables/Table';
import { TableColumnSchema } from '@ui/table-schema';
import { useAttendanceData } from '@hooks/domain/313/useAnalytics';
import { formatForGoogleSheets } from '@server/file-handling';
import { copyToClipboard } from '@ui/utils';
import { DailyClassEvent } from '@zod-schema/313/core';

// Column definitions for attendance data
const attendanceColumns: TableColumnSchema<DailyClassEvent>[] = [
  {
    id: 'date',
    label: 'Date',
    accessor: (row) => row.date,
    sortable: true,
  },
  {
    id: 'studentName',
    label: 'Student Name',
    accessor: (row) => `${row.firstName} ${row.lastName}`,
    sortable: true,
  },
  {
    id: 'teacher',
    label: 'Teacher',
    accessor: (row) => row.teacher,
    sortable: true,
  },
  {
    id: 'section',
    label: 'Section',
    accessor: (row) => row.section,
    sortable: true,
  },
  {
    id: 'attendance',
    label: 'Attendance',
    accessor: (row) => row.attendance,
    sortable: true,
  },
  {
    id: 'classLengthMin',
    label: 'Class Length (min)',
    accessor: (row) => row.classLengthMin,
    sortable: true,
  },
  {
    id: 'classMissedMin',
    label: 'Class Missed (min)',
    accessor: (row) => row.classMissedMin || '-',
    sortable: true,
  },
  {
    id: 'teacherInterventionMin',
    label: 'Intervention (min)',
    accessor: (row) => row.teacherInterventionMin,
    sortable: true,
  },
  {
    id: 'interventionNotes',
    label: 'Intervention Notes',
    accessor: (row) => row.interventionNotes || '-',
    sortable: true,
  },
  {
    id: 'behaviorNotes',
    label: 'Behavior Notes',
    accessor: (row) => row.behaviorNotes || '-',
    sortable: true,
  },
];

// Column mapping for CSV export with human-readable headers
const columnMapping = {
  date: 'Date',
  firstName: 'First Name',
  lastName: 'Last Name',
  teacher: 'Teacher',
  section: 'Section',
  attendance: 'Attendance Status',
  classLengthMin: 'Class Length (minutes)',
  classMissedMin: 'Class Missed (minutes)',
  teacherInterventionMin: 'Teacher Intervention (minutes)',
  interventionNotes: 'Intervention Notes',
  behaviorNotes: 'Behavior Notes',
  studentIDref: 'Student ID'
};

export default function AttendanceAnalyticsPage() {
  const { data, isLoading, error, refetch } = useAttendanceData();
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyToSheets = async () => {
    if (!data || data.length === 0) {
      alert('No data available to copy');
      return;
    }

    try {
      const csvData = formatForGoogleSheets(data as unknown as Record<string, unknown>[], columnMapping);
      const success = await copyToClipboard(csvData);
      
      if (success) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } else {
        alert('Failed to copy to clipboard. Please try again.');
      }
    } catch (error) {
      console.error('Copy error:', error);
      alert('Failed to copy to clipboard. Please try again.');
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link href="/analytics" className="text-blue-600 hover:text-blue-700">
              ← Back to Analytics
            </Link>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/analytics" className="text-blue-600 hover:text-blue-700">
            ← Back to Analytics
          </Link>
        </div>

        {/* Header with Export Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Data</h1>
            <p className="text-gray-600 mt-1">
              {isLoading ? 'Loading...' : `${data?.length || 0} records`}
            </p>
          </div>
          
          <button 
            onClick={handleCopyToSheets}
            disabled={isLoading || !data || data.length === 0}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              copySuccess 
                ? 'bg-purple-500 text-white' 
                : 'bg-purple-500 text-white hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed'
            }`}
          >
            {copySuccess ? '✓ Copied!' : 'Copy for Sheets'}
          </button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading attendance data...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Table
              data={data || []}
              columns={attendanceColumns}
              compact={true}
              emptyMessage="No attendance data available"
              textSize="sm"
            />
          </div>
        )}

        {/* Export Instructions */}
        {data && data.length > 0 && (
          <div className="mt-6 bg-purple-50 rounded-lg p-4">
            <h3 className="font-medium text-purple-900 mb-2">Export Instructions</h3>
            <p className="text-purple-800 text-sm">
              Click &quot;Copy for Sheets&quot; above, then paste (Ctrl+V) into Google Sheets cell A1. 
              The data will automatically format into columns for analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 