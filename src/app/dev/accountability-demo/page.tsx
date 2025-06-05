'use client'

import { useState } from 'react'
import { AccountabilityTrackingPanel } from '@domain-components/scheduling/AccountabilityTrackingPanel'
import { useAccountabilityTracking } from '@hooks/ui/useAccountabilityTracking'
import { Text } from '@core-components/typography'

// Mock teachers data
const mockTeachers = [
  { id: '1', name: 'Sarah Johnson' },
  { id: '2', name: 'Mike Chen' },
  { id: '3', name: 'Emily Rodriguez' },
  { id: '4', name: 'David Park' },
  { id: '5', name: 'Lisa Thompson' }
]

export default function AccountabilityDemoPage() {
  const [variant, setVariant] = useState<'default' | 'compact'>('default')
  const {
    iconAccountability,
    toggleObservation,
    toggleMeeting,
    getCompletionStats
  } = useAccountabilityTracking()

  // Transform iconAccountability to the format expected by AccountabilityTrackingPanel
  const transformedAccountability = iconAccountability.map(state => ({
    teacherId: state.teacherId,
    hasObservation: state.hasObservation,
    hasMeeting: state.hasMeeting
  }))

  const stats = getCompletionStats()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <Text as="h1" textSize="2xl" className="text-gray-900 font-bold">
            Accountability Icon System Demo
          </Text>
          <Text textSize="lg" color="muted" className="mt-2">
            Testing the new icon-based accountability tracking interface
          </Text>
        </div>

        {/* Variant Toggle */}
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <Text textSize="sm" className="mb-2 text-gray-700 font-medium">
              Display Variant:
            </Text>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="variant"
                  value="default"
                  checked={variant === 'default'}
                  onChange={(e) => setVariant(e.target.value as 'default' | 'compact')}
                  className="mr-2"
                />
                <Text textSize="sm">Default (Table Layout)</Text>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="variant"
                  value="compact"
                  checked={variant === 'compact'}
                  onChange={(e) => setVariant(e.target.value as 'default' | 'compact')}
                  className="mr-2"
                />
                <Text textSize="sm">Compact (Icon Row)</Text>
              </label>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <Text textSize="lg" className="mb-4 text-gray-900 font-medium">
            Completion Statistics
          </Text>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Text textSize="2xl" className="text-blue-600 font-bold">
                {stats.completedObservations}
              </Text>
              <Text textSize="sm" color="muted">Observations</Text>
            </div>
            <div className="text-center">
              <Text textSize="2xl" className="text-green-600 font-bold">
                {stats.completedMeetings}
              </Text>
              <Text textSize="sm" color="muted">Meetings</Text>
            </div>
            <div className="text-center">
              <Text textSize="2xl" className="text-gray-900 font-bold">
                {stats.totalCompleted}
              </Text>
              <Text textSize="sm" color="muted">Total Completed</Text>
            </div>
            <div className="text-center">
              <Text textSize="2xl" className="text-purple-600 font-bold">
                {stats.completionRate.toFixed(0)}%
              </Text>
              <Text textSize="sm" color="muted">Completion Rate</Text>
            </div>
          </div>
        </div>

        {/* Accountability Panel */}
        <AccountabilityTrackingPanel
          teachers={mockTeachers}
          accountabilityState={transformedAccountability}
          onObservationToggle={toggleObservation}
          onMeetingToggle={toggleMeeting}
          variant={variant}
        />

        {/* Debug Info */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <Text textSize="sm" className="mb-2 text-gray-700 font-medium">
            Debug Information:
          </Text>
          <pre className="text-xs text-gray-600 overflow-auto">
            {JSON.stringify(iconAccountability, null, 2)}
          </pre>
        </div>

        {/* Usage Instructions */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <Text textSize="lg" className="mb-4 text-blue-900 font-medium">
            How to Use
          </Text>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Click the empty circles to mark observations (blue pencil icon) or meetings (green speech bubble icon)</li>
            <li>• Click filled icons to unmark them (returns to empty circle)</li>
            <li>• Switch between default table layout and compact icon row layout</li>
            <li>• View real-time completion statistics above</li>
            <li>• Icons provide visual feedback with hover states and accessibility labels</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 