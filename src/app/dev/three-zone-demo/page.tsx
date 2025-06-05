'use client'

import { useState } from 'react'
import { ThreeZoneTimeSlot } from '@core-components/interactive/ThreeZoneTimeSlot'
import { Text } from '@core-components/typography'
import type { ScheduleAssignmentType, TimeSlot } from '@zod-schema/visits/planned-visit'

// Mock bell schedule data
const mockBellSchedule: (TimeSlot & { periodLabel: string })[] = [
  { startTime: '08:00', endTime: '08:50', periodLabel: 'Period 1' },
  { startTime: '08:55', endTime: '09:45', periodLabel: 'Period 2' },
  { startTime: '09:50', endTime: '10:40', periodLabel: 'Period 3' },
  { startTime: '10:45', endTime: '11:35', periodLabel: 'Period 4' },
  { startTime: '11:40', endTime: '12:30', periodLabel: 'Lunch' },
  { startTime: '12:35', endTime: '13:25', periodLabel: 'Period 5' },
  { startTime: '13:30', endTime: '14:20', periodLabel: 'Period 6' },
  { startTime: '14:25', endTime: '15:15', periodLabel: 'Period 7' }
]

// Mock teacher names for assignments
const mockTeachers = [
  'Sarah Johnson', 'Mike Chen', 'Emily Rodriguez', 'David Park', 
  'Lisa Thompson', 'James Wilson', 'Maria Garcia', 'Alex Kim'
]

interface Assignment {
  timeSlot: TimeSlot
  zone: ScheduleAssignmentType
  periodLabel: string
  teacherName: string
  timestamp: Date
}

export default function ThreeZoneDemoPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [globalHoverZone, setGlobalHoverZone] = useState<ScheduleAssignmentType | null>(null)
  const [globalHoverTimeSlot, setGlobalHoverTimeSlot] = useState<TimeSlot | null>(null)
  const [selectedSize, setSelectedSize] = useState<'sm' | 'md' | 'lg'>('md')
  const [showLabels, setShowLabels] = useState(true)
  const [demoMode, setDemoMode] = useState<'individual' | 'grid' | 'comparison'>('comparison')

  // Handle zone clicks
  const handleZoneClick = (zone: ScheduleAssignmentType, timeSlot: TimeSlot, periodLabel: string) => {
    // Get random teacher name for tracking purposes (not displayed in component)
    const teacherName = mockTeachers[Math.floor(Math.random() * mockTeachers.length)]
    
    const assignment: Assignment = {
      timeSlot,
      zone,
      periodLabel,
      teacherName,
      timestamp: new Date()
    }
    
    // Replace existing assignment for this time slot or add new one
    setAssignments(prev => [
      ...prev.filter(a => 
        !(a.timeSlot.startTime === timeSlot.startTime && 
          a.timeSlot.endTime === timeSlot.endTime)
      ),
      assignment
    ])
  }

  // Handle hover changes
  const handleHoverChange = (zone: ScheduleAssignmentType | null, timeSlot: TimeSlot) => {
    setGlobalHoverZone(zone)
    setGlobalHoverTimeSlot(zone ? timeSlot : null)
  }

  // Clear assignments
  const clearAssignments = () => {
    setAssignments([])
  }

  // Get assignment for time slot
  const getAssignmentForTimeSlot = (timeSlot: TimeSlot) => {
    return assignments.find(a => 
      a.timeSlot.startTime === timeSlot.startTime && 
      a.timeSlot.endTime === timeSlot.endTime
    )
  }

  // Statistics
  const stats = {
    totalAssignments: assignments.length,
    fullPeriodAssignments: assignments.filter(a => a.zone === 'full_period').length,
    firstHalfAssignments: assignments.filter(a => a.zone === 'first_half').length,
    secondHalfAssignments: assignments.filter(a => a.zone === 'second_half').length
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <Text as="h1" textSize="2xl" className="text-gray-900 font-bold">
            Three-Zone Time Slot Redesign Demo
          </Text>
          <Text textSize="lg" color="muted" className="mt-2">
            New split layout design - no overlapping zones, no jitter behavior
          </Text>
        </div>

        {/* Design Improvement Banner */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div>
              <Text textSize="lg" className="text-gray-900 font-medium mb-2">
                ✨ Design Improvements Implemented
              </Text>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>No Overlapping Zones:</strong> Eliminated hover jitter and confusion</li>
                <li>• <strong>Split Layout:</strong> All zones visible simultaneously</li>
                <li>• <strong>Clear Relationships:</strong> First Half + Second Half = Full Period</li>
                <li>• <strong>Independent Interactions:</strong> Each zone has its own hover state</li>
                <li>• <strong>Better Accessibility:</strong> Clearer focus states and larger touch targets</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Size Control */}
            <div>
              <Text textSize="sm" className="mb-2 text-gray-700 font-medium">
                Size:
              </Text>
              <select 
                value={selectedSize} 
                onChange={(e) => setSelectedSize(e.target.value as 'sm' | 'md' | 'lg')}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="sm">Small (h-20)</option>
                <option value="md">Medium (h-24)</option>
                <option value="lg">Large (h-32)</option>
              </select>
            </div>

            {/* Demo Mode */}
            <div>
              <Text textSize="sm" className="mb-2 text-gray-700 font-medium">
                Demo Mode:
              </Text>
              <select 
                value={demoMode} 
                onChange={(e) => setDemoMode(e.target.value as 'individual' | 'grid' | 'comparison')}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="comparison">Split Layout Design</option>
                <option value="individual">Individual Slots</option>
                <option value="grid">Bell Schedule Grid</option>
              </select>
            </div>

            {/* Labels Toggle */}
            <div>
              <Text textSize="sm" className="mb-2 text-gray-700 font-medium">
                Options:
              </Text>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="mr-2"
                />
                <Text textSize="sm">Show Zone Labels</Text>
              </label>
            </div>

            {/* Clear Button */}
            <div>
              <Text textSize="sm" className="mb-2 text-gray-700 font-medium">
                Actions:
              </Text>
              <button
                onClick={clearAssignments}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Current Hover State */}
        {globalHoverZone && globalHoverTimeSlot && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <Text textSize="sm" className="text-blue-900 font-medium">
              🎯 Hovering: {globalHoverZone.replace('_', ' ')} zone for {globalHoverTimeSlot.startTime} - {globalHoverTimeSlot.endTime}
            </Text>
          </div>
        )}

        {/* Statistics */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <Text textSize="lg" className="mb-4 text-gray-900 font-medium">
            Assignment Statistics
          </Text>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Text textSize="2xl" className="text-gray-900 font-bold">
                {stats.totalAssignments}
              </Text>
              <Text textSize="sm" color="muted">Total</Text>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Text textSize="2xl" className="text-blue-600 font-bold">
                {stats.fullPeriodAssignments}
              </Text>
              <Text textSize="sm" color="muted">Full Period</Text>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Text textSize="2xl" className="text-green-600 font-bold">
                {stats.firstHalfAssignments}
              </Text>
              <Text textSize="sm" color="muted">First Half</Text>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Text textSize="2xl" className="text-orange-600 font-bold">
                {stats.secondHalfAssignments}
              </Text>
              <Text textSize="sm" color="muted">Second Half</Text>
            </div>
          </div>
        </div>

        {/* Demo Content */}
        {demoMode === 'comparison' ? (
          /* Split Layout Design Showcase */
          <div className="space-y-6">
            {/* Visual Layout Explanation */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <Text textSize="lg" className="mb-4 text-gray-900 font-medium">
                Split Layout Design
              </Text>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visual Diagram */}
                <div className="space-y-4">
                  <Text textSize="sm" className="text-gray-700 font-medium">Layout Structure:</Text>
                  <div className="bg-gray-50 p-4 rounded-lg font-mono text-xs">
                    <div className="text-gray-600">
                      ┌─────────────────────────────────┐<br/>
                      │        Period 1                 │<br/>
                      │     08:00 - 08:50              │<br/>
                      ├─────────────────────────────────┤<br/>
                      │ ┌─────────────┐ ┌─────────────┐ │<br/>
                      │ │ First Half  │ │             │ │<br/>
                      │ ├─────────────┤ │ Full Period │ │<br/>
                      │ │ Second Half │ │             │ │<br/>
                      │ └─────────────┘ └─────────────┘ │<br/>
                      └─────────────────────────────────┘
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                      <span>First Half: Independent hover state</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
                      <span>Second Half: Independent hover state</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                      <span>Full Period: Independent hover state</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Example */}
                <div className="space-y-4">
                  <Text textSize="sm" className="text-gray-700 font-medium">Interactive Example:</Text>
                  <div className="flex justify-center">
                    <ThreeZoneTimeSlot
                      timeSlot={mockBellSchedule[0]}
                      periodLabel={mockBellSchedule[0].periodLabel}
                      size={selectedSize}
                      onZoneClick={(zone, timeSlot) => handleZoneClick(zone, timeSlot, mockBellSchedule[0].periodLabel)}
                      onHoverChange={handleHoverChange}
                      showLabels={showLabels}
                      className="border-2 border-gray-300"
                    />
                  </div>
                  <Text textSize="xs" className="text-center text-gray-500">
                    Hover over different zones to see independent feedback
                  </Text>
                </div>
              </div>
            </div>

            {/* Benefits Showcase */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <Text textSize="lg" className="mb-4 text-gray-900 font-medium">
                Three Sample Time Slots
              </Text>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockBellSchedule.slice(0, 3).map((period, index) => {
                  const assignment = getAssignmentForTimeSlot(period)
                  return (
                    <div key={index} className="space-y-3">
                      <ThreeZoneTimeSlot
                        timeSlot={period}
                        periodLabel={period.periodLabel}
                        size={selectedSize}
                        onZoneClick={(zone, timeSlot) => handleZoneClick(zone, timeSlot, period.periodLabel)}
                        onHoverChange={handleHoverChange}
                        showLabels={showLabels}
                        className="border-2 border-gray-200"
                      />
                      <div className="text-center">
                        {assignment ? (
                          <Text textSize="xs" className={`
                            px-2 py-1 rounded-full text-white
                            ${assignment.zone === 'full_period' ? 'bg-blue-500' : 
                              assignment.zone === 'first_half' ? 'bg-green-500' : 'bg-orange-500'}
                          `}>
                            {assignment.zone.replace('_', ' ')} - {assignment.teacherName}
                          </Text>
                        ) : (
                          <Text textSize="xs" color="muted">Click any zone to assign</Text>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : demoMode === 'individual' ? (
          /* Individual Time Slots */
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <Text textSize="lg" className="mb-4 text-gray-900 font-medium">
              Individual Time Slots
            </Text>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockBellSchedule.slice(0, 6).map((period, index) => {
                const assignment = getAssignmentForTimeSlot(period)
                return (
                  <div key={index} className="space-y-2">
                    <ThreeZoneTimeSlot
                      timeSlot={period}
                      periodLabel={period.periodLabel}
                      size={selectedSize}
                      onZoneClick={(zone, timeSlot) => handleZoneClick(zone, timeSlot, period.periodLabel)}
                      onHoverChange={handleHoverChange}
                      showLabels={showLabels}
                      className="border-2 border-gray-200"
                    />
                    {assignment && (
                      <div className="text-center">
                        <Text textSize="xs" className={`
                          px-2 py-1 rounded-full text-white
                          ${assignment.zone === 'full_period' ? 'bg-blue-500' : 
                            assignment.zone === 'first_half' ? 'bg-green-500' : 'bg-orange-500'}
                        `}>
                          {assignment.zone.replace('_', ' ')}
                        </Text>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* Bell Schedule Grid */
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <Text textSize="lg" className="mb-4 text-gray-900 font-medium">
              Bell Schedule Grid
            </Text>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {mockBellSchedule.map((period, index) => {
                const assignment = getAssignmentForTimeSlot(period)
                return (
                  <div key={index} className="relative">
                    <ThreeZoneTimeSlot
                      timeSlot={period}
                      periodLabel={period.periodLabel}
                      size={selectedSize}
                      onZoneClick={(zone, timeSlot) => handleZoneClick(zone, timeSlot, period.periodLabel)}
                      onHoverChange={handleHoverChange}
                      showLabels={showLabels}
                      className="border-2 border-gray-200"
                    />
                    {assignment && (
                      <div className="absolute -top-2 -right-2 z-50">
                        <div className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white
                          ${assignment.zone === 'full_period' ? 'bg-blue-500' : 
                            assignment.zone === 'first_half' ? 'bg-green-500' : 'bg-orange-500'}
                        `}>
                          {assignment.zone === 'full_period' ? 'F' : 
                           assignment.zone === 'first_half' ? '1' : '2'}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Assignment History */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <Text textSize="lg" className="mb-4 text-gray-900 font-medium">
            Assignment History
          </Text>
          {assignments.length === 0 ? (
            <Text color="muted" textSize="sm">
              No assignments yet. Click on time slot zones to create assignments with random teachers.
            </Text>
          ) : (
            <div className="space-y-2">
              {assignments.map((assignment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-3 h-3 rounded-full
                      ${assignment.zone === 'full_period' ? 'bg-blue-500' : 
                        assignment.zone === 'first_half' ? 'bg-green-500' : 'bg-orange-500'}
                    `} />
                    <Text textSize="sm" className="font-medium">
                      {assignment.periodLabel}
                    </Text>
                    <Text textSize="sm" color="muted">
                      {assignment.timeSlot.startTime} - {assignment.timeSlot.endTime}
                    </Text>
                    <Text textSize="xs" className={`
                      px-2 py-1 rounded-full text-white
                      ${assignment.zone === 'full_period' ? 'bg-blue-500' : 
                        assignment.zone === 'first_half' ? 'bg-green-500' : 'bg-orange-500'}
                    `}>
                      {assignment.zone.replace('_', ' ')}
                    </Text>
                    <Text textSize="sm" className="text-gray-700 font-medium">
                      {assignment.teacherName}
                    </Text>
                  </div>
                  <Text textSize="xs" color="muted">
                    {assignment.timestamp.toLocaleTimeString()}
                  </Text>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Updated Zone Legend */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <Text textSize="lg" className="mb-4 text-gray-900 font-medium">
            Split Layout Zone Guide
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-4 h-4 bg-green-500 rounded" />
                <Text textSize="sm" className="text-green-900 font-medium">First Half</Text>
              </div>
              <Text textSize="xs" className="text-green-800">
                Left column, top section. Independent hover state with no interference from other zones.
                Perfect for partial period visits.
              </Text>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-4 h-4 bg-orange-500 rounded" />
                <Text textSize="sm" className="text-orange-900 font-medium">Second Half</Text>
              </div>
              <Text textSize="xs" className="text-orange-800">
                Left column, bottom section. Independent hover state clearly separated from First Half.
                Ideal for follow-up sessions.
              </Text>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-4 h-4 bg-blue-500 rounded" />
                <Text textSize="sm" className="text-blue-900 font-medium">Full Period</Text>
              </div>
              <Text textSize="xs" className="text-blue-800">
                Right column, full height. Visually demonstrates that First Half + Second Half = Full Period.
                No overlapping interactions.
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 