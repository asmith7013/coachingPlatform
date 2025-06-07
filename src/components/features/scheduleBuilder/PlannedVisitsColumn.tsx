'use client'

import { tv } from 'tailwind-variants'
import { Card } from '@composed-components/cards/Card'
import { Text } from '@core-components/typography'
import { CalendarIcon } from '@heroicons/react/24/outline'
import type { VisitPortion } from './types'

const plannedVisitsColumn = tv({
  slots: {
    container: 'sticky left-0 z-20 w-48 bg-white border-r-2 border-gray-300 flex flex-col',
    header: 'bg-gray-100 border-b border-gray-200 p-3 text-center font-semibold text-sm',
    content: 'flex-1 overflow-y-auto',
    periodRow: 'min-h-[80px] border-b border-gray-100 p-2 flex flex-col justify-center',
    emptyState: 'flex flex-col items-center justify-center py-8 text-gray-400',
    emptyIcon: 'w-8 h-8 mb-2',
    visitStack: 'space-y-1'
  }
})

export interface PlannedVisitsColumnProps {
  visits: ScheduledVisit[]
  periodTimes: Array<{ period: number; start: string; end: string }>
  onVisitEdit?: (visitId: string) => void
  onVisitDelete?: (visitId: string) => void
  className?: string
}

export interface ScheduledVisit {
  id: string
  teacherId: string
  teacherName: string
  periodNumber: number
  portion: VisitPortion
  purpose?: string
  createdAt: Date
}

export function PlannedVisitsColumn({
  visits,
  periodTimes,
  onVisitEdit: _onVisitEdit,
  onVisitDelete: _onVisitDelete,
  className
}: PlannedVisitsColumnProps) {
  const styles = plannedVisitsColumn()

  // Group visits by period number
  const visitsByPeriod = visits.reduce((acc, visit) => {
    if (!acc[visit.periodNumber]) {
      acc[visit.periodNumber] = []
    }
    acc[visit.periodNumber].push(visit)
    return acc
  }, {} as Record<number, ScheduledVisit[]>)

  const renderEmptyState = () => (
    <div className={styles.emptyState()}>
      <CalendarIcon className={styles.emptyIcon()} />
      <Text textSize="sm" color="muted" className="text-center">
        No visits planned
      </Text>
      <Text textSize="xs" color="muted" className="text-center mt-1">
        Use Schedule mode to plan visits
      </Text>
    </div>
  )

  const renderVisitsByPeriod = () => {
    return periodTimes.map((periodTime) => {
      const periodVisits = visitsByPeriod[periodTime.period] || []
      
      return (
        <div key={periodTime.period} className={styles.periodRow()}>
          {periodVisits.length > 0 ? (
            <div className={styles.visitStack()}>
              {periodVisits.map((visit) => (
                <Card
                  key={visit.id}
                  padding="sm"
                  radius="md"
                  className="bg-blue-50 border border-blue-200"
                >
                  <div className="space-y-1">
                    <Text textSize="xs" weight="medium" className="text-blue-900 truncate">
                      {visit.teacherName}
                    </Text>
                    <div className="flex items-center justify-between">
                      <Text textSize="xs" color="muted">
                        {formatVisitPortion(visit.portion)}
                      </Text>
                      {visit.purpose && (
                        <Text textSize="xs" color="muted" className="truncate">
                          {visit.purpose}
                        </Text>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <Text textSize="xs" color="muted">-</Text>
            </div>
          )}
        </div>
      )
    })
  }

  const hasVisits = visits.length > 0

  return (
    <div className={`${styles.container()} ${className || ''}`}>
      {/* Header */}
      <div className={styles.header()}>
        Planned Visits
      </div>
      
      {/* Content */}
      <div className={styles.content()}>
        {hasVisits ? renderVisitsByPeriod() : renderEmptyState()}
      </div>
    </div>
  )
}

// Helper function to format visit portion
function formatVisitPortion(portion: VisitPortion): string {
  switch (portion) {
    case 'first_half':
      return 'First Half'
    case 'second_half':
      return 'Second Half'
    case 'full_period':
      return 'Full Period'
    default:
      return 'Unknown'
  }
}

export default PlannedVisitsColumn 