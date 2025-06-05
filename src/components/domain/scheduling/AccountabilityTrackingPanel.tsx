'use client'

import { useMemo } from 'react'
import { tv } from 'tailwind-variants'
import { Text } from '@core-components/typography'
import { AccountabilityIcon } from '@core-components/icons/AccountabilityIcon'

const accountabilityPanel = tv({
  slots: {
    container: 'bg-white border border-gray-200 rounded-lg overflow-hidden',
    header: 'bg-gray-50 border-b border-gray-200 px-4 py-3',
    title: 'text-sm font-medium text-gray-900',
    grid: 'overflow-x-auto',
    table: 'w-full min-w-max',
    headerRow: 'border-b border-gray-200',
    headerCell: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
    row: 'border-b border-gray-100 hover:bg-gray-50 transition-colors',
    nameCell: 'px-4 py-3 text-sm font-medium text-gray-900 min-w-[120px]',
    iconCell: 'px-4 py-3 text-center',
    // Icon-specific styles for compact layout
    compactHeader: 'bg-blue-50 border-b border-blue-200 px-4 py-2',
    compactTitle: 'text-xs font-medium text-blue-900',
    iconRow: 'bg-blue-25 border-b border-blue-100 py-2',
    iconGrid: 'grid grid-cols-[minmax(120px,1fr)_repeat(auto-fit,minmax(40px,1fr))] gap-2 px-4 items-center'
  },
  variants: {
    variant: {
      default: {}, // Table layout (existing)
      compact: {}  // Icon row layout (new)
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

interface Teacher {
  id: string
  name: string
}

interface AccountabilityState {
  teacherId: string
  hasObservation: boolean
  hasMeeting: boolean
}

interface AccountabilityTrackingPanelProps {
  teachers: Teacher[]
  accountabilityState?: AccountabilityState[]
  onObservationToggle: (teacherId: string, checked: boolean) => void
  onMeetingToggle: (teacherId: string, checked: boolean) => void
  className?: string
  variant?: 'default' | 'compact'
}

export function AccountabilityTrackingPanel({
  teachers,
  accountabilityState = [],
  onObservationToggle,
  onMeetingToggle,
  className,
  variant = 'default'
}: AccountabilityTrackingPanelProps) {
  const styles = accountabilityPanel({ variant })
  
  // Create accountability lookup map for efficient access
  const accountabilityMap = useMemo(() => {
    const map = new Map<string, AccountabilityState>()
    accountabilityState.forEach(state => {
      map.set(state.teacherId, state)
    })
    return map
  }, [accountabilityState])
  
  // Get accountability state for a teacher
  const getTeacherState = (teacherId: string): AccountabilityState => {
    return accountabilityMap.get(teacherId) || {
      teacherId,
      hasObservation: false,
      hasMeeting: false
    }
  }

  if (teachers.length === 0) {
    return (
      <div className={`${styles.container()} ${className || ''}`}>
        <div className={variant === 'compact' ? styles.compactHeader() : styles.header()}>
          <Text className={variant === 'compact' ? styles.compactTitle() : styles.title()}>
            Teacher Accountability Tracking
          </Text>
        </div>
        <div className="p-8 text-center">
          <Text color="muted" textSize="sm">
            No teachers available for accountability tracking
          </Text>
        </div>
      </div>
    )
  }

  // Compact variant with icon row above teacher columns
  if (variant === 'compact') {
    return (
      <div className={`${styles.container()} ${className || ''}`}>
        <div className={styles.compactHeader()}>
          <Text className={styles.compactTitle()}>
            Accountability Tracker
          </Text>
        </div>
        
        <div className={styles.iconRow()}>
          <div className={styles.iconGrid()}>
            {/* Teacher names column */}
            <div className="text-xs font-medium text-gray-600">Teachers</div>
            
            {/* Icon columns for each teacher */}
            {teachers.map((teacher) => {
              const state = getTeacherState(teacher.id)
              
              return (
                <div key={teacher.id} className="flex flex-col items-center space-y-1">
                  {/* Teacher name (truncated) */}
                  <div className="text-xs text-gray-700 text-center truncate max-w-[60px]" title={teacher.name}>
                    {teacher.name.split(' ')[0]} {/* First name only for compact view */}
                  </div>
                  
                  {/* Accountability icons */}
                  <div className="flex space-x-1">
                    <AccountabilityIcon
                      type="observation"
                      filled={state.hasObservation}
                      size="sm"
                      onClick={() => onObservationToggle(teacher.id, !state.hasObservation)}
                      label={`${teacher.name} observation`}
                    />
                    <AccountabilityIcon
                      type="meeting"
                      filled={state.hasMeeting}
                      size="sm"
                      onClick={() => onMeetingToggle(teacher.id, !state.hasMeeting)}
                      label={`${teacher.name} meeting`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Compact legend */}
        <div className="bg-gray-50 px-4 py-1 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <AccountabilityIcon type="observation" filled={true} size="sm" />
              <span>Observation</span>
            </div>
            <div className="flex items-center space-x-1">
              <AccountabilityIcon type="meeting" filled={true} size="sm" />
              <span>Meeting</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default variant with table layout using icons
  return (
    <div className={`${styles.container()} ${className || ''}`}>
      <div className={styles.header()}>
        <Text className={styles.title()}>
          Teacher Accountability Tracking
        </Text>
      </div>
      
      <div className={styles.grid()}>
        <table className={styles.table()}>
          <thead>
            <tr className={styles.headerRow()}>
              <th className={styles.headerCell()}>Teacher</th>
              <th className={styles.headerCell()}>Observation</th>
              <th className={styles.headerCell()}>Meeting</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => {
              const state = getTeacherState(teacher.id)
              
              return (
                <tr key={teacher.id} className={styles.row()}>
                  <td className={styles.nameCell()}>
                    {teacher.name}
                  </td>
                  <td className={styles.iconCell()}>
                    <AccountabilityIcon
                      type="observation"
                      filled={state.hasObservation}
                      onClick={() => onObservationToggle(teacher.id, !state.hasObservation)}
                      label={`${teacher.name} observation`}
                    />
                  </td>
                  <td className={styles.iconCell()}>
                    <AccountabilityIcon
                      type="meeting"
                      filled={state.hasMeeting}
                      onClick={() => onMeetingToggle(teacher.id, !state.hasMeeting)}
                      label={`${teacher.name} meeting`}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      {/* Icon legend */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <Text textSize="xs" color="muted">
            Click icons to mark observation and meeting completion for each teacher.
          </Text>
          <div className="flex items-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <AccountabilityIcon type="observation" filled={true} size="sm" />
              <span>Observation</span>
            </div>
            <div className="flex items-center space-x-1">
              <AccountabilityIcon type="meeting" filled={true} size="sm" />
              <span>Meeting</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountabilityTrackingPanel 