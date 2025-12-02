'use client'

import { useEffect, useState } from 'react'
import { getAnalyticsStats } from '@/app/actions/analytics'
import { Card } from '@/components/ui/card'

interface AnalyticsStats {
  totalViews: number
  uniqueUsers: number
  avgDuration: number
  topPages: Array<{
    page: string
    views: number
    avgDuration: number
  }>
  dailyViews: Array<{
    date: string
    views: number
    uniqueUsers: number
  }>
}

interface AnalyticsDashboardProps {
  userId?: string
  startDate?: Date
  endDate?: Date
}

export function AnalyticsDashboard({ userId, startDate, endDate }: AnalyticsDashboardProps) {
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const result = await getAnalyticsStats(userId, startDate, endDate)

        if (result.success && result.data) {
          setStats(result.data as AnalyticsStats)
        } else {
          setError(result.error || 'Failed to load analytics')
        }
      } catch (err) {
        setError('Failed to load analytics')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userId, startDate, endDate])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-500">Total Page Views</div>
          <div className="text-3xl font-bold mt-2">{stats.totalViews.toLocaleString()}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-medium text-gray-500">Unique Users</div>
          <div className="text-3xl font-bold mt-2">{stats.uniqueUsers.toLocaleString()}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-medium text-gray-500">Avg. Time on Page</div>
          <div className="text-3xl font-bold mt-2">
            {Math.round(stats.avgDuration || 0)}s
          </div>
        </Card>
      </div>

      {/* Top Pages */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Most Visited Pages</h3>
        <div className="space-y-3">
          {stats.topPages.map((page, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-3 last:border-b-0">
              <div className="flex-1">
                <div className="font-medium">{page.page}</div>
                <div className="text-sm text-gray-500">
                  Avg. time: {Math.round(page.avgDuration || 0)}s
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{page.views.toLocaleString()}</div>
                <div className="text-sm text-gray-500">views</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Daily Views */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Page Views</h3>
        <div className="space-y-2">
          {stats.dailyViews.slice(-14).map((day, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="font-medium">{day.date}</div>
              <div className="flex gap-4">
                <div>
                  <span className="text-gray-500">Views:</span>{' '}
                  <span className="font-semibold">{day.views}</span>
                </div>
                <div>
                  <span className="text-gray-500">Users:</span>{' '}
                  <span className="font-semibold">{day.uniqueUsers}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
