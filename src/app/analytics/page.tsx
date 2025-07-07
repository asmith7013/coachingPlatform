'use client'

import React from 'react'
import { TanStackTable } from '@/components/composed/tables/tanstack/TanStackTable'
import { TableCell } from '@/components/composed/tables/parts/cell'
import { useZearnData, useSnorklData, useAttendanceData } from '@hooks/domain/313/useAnalytics'
import { ColumnDef } from '@tanstack/react-table'
import type { ZearnCompletion, AssessmentCompletion, DailyClassEvent } from '@zod-schema/313/core'

// Quick overview columns for each data type
const zearnOverviewColumns: ColumnDef<ZearnCompletion>[] = [
  {
    accessorKey: 'studentName',
    header: 'Student',
    cell: ({ getValue }) => (
      <TableCell variant="default">
        <span className="font-medium">{String(getValue())}</span>
      </TableCell>
    ),
  },
  {
    accessorKey: 'lessonCode',
    header: 'Lesson',
    cell: ({ getValue }) => (
      <TableCell variant="muted">
        <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
          {String(getValue())}
        </code>
      </TableCell>
    ),
  },
  {
    accessorKey: 'completed',
    header: 'Status',
    cell: ({ getValue }) => {
      const completed = getValue() as boolean
      return (
        <TableCell variant={completed ? 'default' : 'danger'}>
          <span className={`px-2 py-1 rounded-full text-xs ${
            completed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {completed ? '✅ Complete' : '⏳ Pending'}
          </span>
        </TableCell>
      )
    },
  },
]

const snorklOverviewColumns: ColumnDef<AssessmentCompletion>[] = [
  {
    accessorKey: 'studentName',
    header: 'Student',
    cell: ({ getValue }) => (
      <TableCell variant="default">
        <span className="font-medium">{String(getValue())}</span>
      </TableCell>
    ),
  },
  {
    accessorKey: 'lessonCode',
    header: 'Lesson',
    cell: ({ getValue }) => (
      <TableCell variant="muted">
        <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
          {String(getValue())}
        </code>
      </TableCell>
    ),
  },
  {
    accessorKey: 'snorklScore',
    header: 'Score',
    cell: ({ getValue }) => {
      const score = getValue() as number | undefined
      return (
        <TableCell variant="default">
          {score ? (
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              score >= 3 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {score}/4
            </span>
          ) : '—'}
        </TableCell>
      )
    },
  },
]

const attendanceOverviewColumns: ColumnDef<DailyClassEvent>[] = [
  {
    accessorKey: 'studentName',
    header: 'Student',
    cell: ({ getValue }) => (
      <TableCell variant="default">
        <span className="font-medium">{String(getValue())}</span>
      </TableCell>
    ),
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ getValue }) => (
      <TableCell variant="muted">
        {String(getValue())}
      </TableCell>
    ),
  },
  {
    accessorKey: 'attendanceStatus',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue() as string
      const isPresent = status?.toLowerCase().includes('present') || false
      return (
        <TableCell variant={isPresent ? 'default' : 'danger'}>
          <span className={`px-2 py-1 rounded-full text-xs ${
            isPresent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {status || 'Unknown'}
          </span>
        </TableCell>
      )
    },
  },
]

export default function AnalyticsOverviewPage() {
  const { data: zearnData, isLoading: zearnLoading } = useZearnData()
  const { data: snorklData, isLoading: snorklLoading } = useSnorklData()
  const { data: attendanceData, isLoading: attendanceLoading } = useAttendanceData()

  // Get recent data for overview (limit to 5 items each)
  const recentZearn = (zearnData || []).slice(0, 5)
  const recentSnorkl = (snorklData || []).slice(0, 5)
  const recentAttendance = (attendanceData || []).slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Overview</h1>
        <p className="text-gray-600">
          Monitor student progress across Zearn, Snorkl, and attendance data.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold">Z</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Zearn Completions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {zearnLoading ? '...' : (zearnData?.length || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-semibold">S</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Snorkl Completions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {snorklLoading ? '...' : (snorklData?.length || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-semibold">A</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Attendance Records</p>
              <p className="text-2xl font-semibold text-gray-900">
                {attendanceLoading ? '...' : (attendanceData?.length || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="space-y-8">
        {/* Recent Zearn Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Zearn Activity</h2>
            <a 
              href="/analytics/zearn" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View all →
            </a>
          </div>
          <div className="bg-white rounded-lg shadow border">
            <TanStackTable
              data={recentZearn}
              columns={zearnOverviewColumns}
              loading={zearnLoading}
              emptyMessage="No recent Zearn activity"
            />
          </div>
        </div>

        {/* Recent Snorkl Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Snorkl Activity</h2>
            <a 
              href="/analytics/snorkl" 
              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              View all →
            </a>
          </div>
          <div className="bg-white rounded-lg shadow border">
            <TanStackTable
              data={recentSnorkl}
              columns={snorklOverviewColumns}
              loading={snorklLoading}
              emptyMessage="No recent Snorkl activity"
            />
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Attendance</h2>
            <a 
              href="/analytics/attendance" 
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              View all →
            </a>
          </div>
          <div className="bg-white rounded-lg shadow border">
            <TanStackTable
              data={recentAttendance}
              columns={attendanceOverviewColumns}
              loading={attendanceLoading}
              emptyMessage="No recent attendance data"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 