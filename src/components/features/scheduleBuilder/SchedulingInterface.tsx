'use client'

import { tv } from 'tailwind-variants'
import { Text } from '@core-components/typography'
import { Button } from '@core-components'
import { ThreeZoneTimeSlot } from './ThreeZoneTimeSlot'
import type { 
  VisitPortion 
} from './types'
import { UseThreeZoneSchedulingReturn } from './hooks'
import type { BellSchedule } from '@/lib/schema/zod-schema/schedule/schedule'
import type { NYCPSStaff } from '@zod-schema/core/staff'

const schedulingInterface = tv({
  slots: {
    container: 'space-y-4',
    selectionStatus: 'bg-blue-50 border border-blue-200 rounded-lg p-3',
    scheduleGrid: 'bg-white rounded-md shadow-sm h-[600px] overflow-auto',
    gridContent: 'p-4 space-y-4',
    teacherSection: 'space-y-3',
    periodSection: 'space-y-3',
    mainGrid: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
    teacherList: 'space-y-2 max-h-96 overflow-y-auto',
    teacherButton: 'w-full p-3 text-left rounded-lg border-2 transition-colors',
    periodList: 'space-y-2',
    conflictWarnings: 'bg-red-50 border border-red-200 rounded-lg p-4 space-y-2',
    actionButtons: 'space-x-2'
  },
  variants: {
    teacherSelected: {
      true: {
        teacherButton: 'border-blue-500 bg-blue-50 text-blue-700'
      },
      false: {
        teacherButton: 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
      }
    }
  }
})

export interface SchedulingInterfaceProps {
  /** Three-zone scheduling hook return object */
  scheduling: UseThreeZoneSchedulingReturn
  /** Available staff for selection */
  staff: NYCPSStaff[]
  /** Bell schedule for period times */
  bellSchedule: BellSchedule
  /** Handle period-portion selection */
  onPeriodPortionSelect: (periodNumber: number, portion: VisitPortion) => void
  /** Handle visit scheduling */
  onScheduleVisit: (purpose?: string) => Promise<void>
  /** Optional class name */
  className?: string
}

export function SchedulingInterface({
  scheduling,
  staff,
  bellSchedule,
  onPeriodPortionSelect,
  onScheduleVisit,
  className
}: SchedulingInterfaceProps) {
  const styles = schedulingInterface()

  return (
    <div className={`${styles.container()} ${className || ''}`}>
      {/* Selection Status Panel */}
      {(scheduling.selectedPortion || scheduling.selectedTeachers.length > 0) && (
        <div className={styles.selectionStatus()}>
          <div className="flex items-center justify-between">
            <div>
              <Text textSize="sm" weight="medium">
                Current Selection: {scheduling.getSelectionLabel()}
              </Text>
              {scheduling.conflicts.length > 0 && (
                <Text textSize="xs" color="danger">
                  {scheduling.conflicts.length} conflict(s) detected
                </Text>
              )}
            </div>
            <div className={styles.actionButtons()}>
              <Button
                intent="secondary"
                textSize="sm"
                onClick={scheduling.clearSelection}
              >
                Clear
              </Button>
              <Button
                intent="primary"
                textSize="sm"
                onClick={() => onScheduleVisit()}
                disabled={!scheduling.canSchedule || scheduling.isScheduling}
                loading={scheduling.isScheduling}
              >
                Schedule Visit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Three-Zone Schedule Grid */}
      <div className={styles.scheduleGrid()}>
        <div className={styles.gridContent()}>
          <Text weight="medium">Select teachers and time periods for visit scheduling:</Text>
          
          {/* Teacher Selection and Period Grid */}
          <div className={styles.mainGrid()}>
            {/* Teachers List */}
            <div className={styles.teacherSection()}>
              <Text textSize="sm" weight="medium" color="muted">
                Teachers ({staff.length})
              </Text>
              <div className={styles.teacherList()}>
                {staff.map((teacher) => (
                  <button
                    key={teacher._id}
                    onClick={() => scheduling.selectTeacher(teacher._id)}
                    className={styles.teacherButton({
                      teacherSelected: scheduling.selectedTeachers.includes(teacher._id)
                    })}
                  >
                    <Text textSize="sm" weight="medium">
                      {teacher.staffName}
                    </Text>
                    {teacher.email && (
                      <Text textSize="xs" color="muted">
                        {teacher.email}
                      </Text>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Time Periods */}
            <div className={styles.periodSection()}>
              <Text textSize="sm" weight="medium" color="muted">
                Time Periods
              </Text>
              <div className={styles.periodList()}>
                {bellSchedule.classSchedule.map((period, index) => (
                  <ThreeZoneTimeSlot
                    key={index}
                    periodNumber={index + 1}
                    timeStart={period.startTime}
                    timeEnd={period.endTime}
                    periodLabel={`Period ${index + 1}`}
                    selectedPortion={
                      scheduling.selectedPeriodNumber === (index + 1)
                        ? scheduling.selectedPortion
                        : null
                    }
                    onSelect={onPeriodPortionSelect}
                    className="w-full"
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Conflict Warnings */}
          {scheduling.conflicts.length > 0 && (
            <div className={styles.conflictWarnings()}>
              <Text textSize="sm" weight="medium" color="danger">
                Conflicts Detected:
              </Text>
              {scheduling.conflicts.map((conflict, index) => (
                <div key={index} className="text-red-700">
                  <Text textSize="xs">
                    • {conflict.message}
                  </Text>
                  {conflict.suggestions && conflict.suggestions.map((suggestion, suggestionIndex) => (
                    <Text key={suggestionIndex} textSize="xs" color="muted">
                      Suggestion: {suggestion}
                    </Text>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SchedulingInterface 