import React from 'react';
import { tv } from 'tailwind-variants';
import { cn } from '@ui/utils/formatters';
import { ScheduleAssignmentType, SessionPurposes, ScheduleAssignment } from '@enums';
import { Eye, MessageCircle, Users } from 'lucide-react';
import type { DropZoneCellProps } from './types';
import { 
  createDropZoneItems, 
  getEventLabel,
  isPeriodPortionAvailable,
  isPortionScheduled
} from './utils';
import { scheduleColors } from './styles/schedule-variants';

/**
 * DropZoneCell Tailwind Variants
 * Updated with badge-style scheduled items
 */
const dropZoneCell = tv({
  slots: {
    container: "h-16 p-1",
    emptyDropZone: "h-full border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500 text-xs",
    buttonArea: "space-y-1",
    
    // Updated styled badge slots
    scheduledBadge: "px-2 py-1 rounded-md border text-xs font-medium flex items-center space-x-1 min-h-[2rem]",
    badgeIcon: "w-3 h-3 flex-shrink-0",
    badgeContent: "flex flex-col flex-1 min-w-0",
    eventLabel: "font-medium leading-tight",
    teacherName: "text-current truncate leading-tight opacity-90",
    
    button: "px-2 py-1 rounded text-xs font-medium transition-colors"
  },
  variants: {
    eventType: {
      observation: {
        scheduledBadge: scheduleColors.planning.observation.planned
      },
      debrief: {
        scheduledBadge: scheduleColors.planning.meeting.planned
      },
      coPlanning: {
        scheduledBadge: scheduleColors.planning.meeting.planned
      },
      plc: {
        scheduledBadge: scheduleColors.planning.meeting.planned
      }
    },
    portion: {
      full: {
        button: scheduleColors.fullPeriod
      },
      firstHalf: {
        button: scheduleColors.firstHalf
      },
      secondHalf: {
        button: scheduleColors.secondHalf
      }
    }
  }
});

/**
 * DropZoneCell Component
 * Now displays scheduled items as styled badges with icons and teacher names
 */
export function DropZoneCell({
  period,
  visits,
  teachers,
  onPortionSelect,
  selectedTeacher,
  selectedPeriod,
  className
}: DropZoneCellProps) {
  
  const dropZoneItems = createDropZoneItems(visits, period, teachers);
  const isThisPeriodSelected = selectedTeacher && selectedPeriod === period;
  const styles = dropZoneCell();

  const isScheduled = (portion: ScheduleAssignmentType): boolean => {
    if (!selectedTeacher) return false;
    return isPortionScheduled(visits, selectedTeacher, period, portion);
  };

  const handlePeriodPortionSelect = async (portion: ScheduleAssignmentType) => {
    if (!selectedTeacher || !onPortionSelect) return;
    
    try {
      await onPortionSelect(selectedTeacher, period, portion);
    } catch (error) {
      console.error('Failed to schedule visit:', error);
    }
  };

  const renderEventIcon = (eventType: string, className: string) => {
    switch (eventType) {
      case 'Observation':
        return <Eye className={className} />;
      case SessionPurposes.DEBRIEF:
      case SessionPurposes.CO_PLANNING:
      case SessionPurposes.PLC:
        return <MessageCircle className={className} />;
      default:
        return <Users className={className} />;
    }
  };

  const getEventTypeVariant = (eventType: string) => {
    switch (eventType) {
      case 'Observation':
        return 'observation';
      case 'Debrief':
        return 'debrief';
      case 'Co-Planning':
        return 'coPlanning';
      case 'PLC':
        return 'plc';
      default:
        return 'observation';
    }
  };

  const isHalfAvailableForSelected = (portion: ScheduleAssignmentType): boolean => {
    if (!selectedTeacher) return false;
    return isPeriodPortionAvailable(visits, selectedTeacher, period, portion);
  };

  // Group items by portion
  const fullPeriodItem = dropZoneItems.find(item => item.portion === ScheduleAssignment.FULL_PERIOD);
  const firstHalfItem = dropZoneItems.find(item => item.portion === ScheduleAssignment.FIRST_HALF);
  const secondHalfItem = dropZoneItems.find(item => item.portion === ScheduleAssignment.SECOND_HALF);

  const renderScheduledBadge = (item: typeof dropZoneItems[0]) => {
    const eventTypeVariant = getEventTypeVariant(item.purpose);
    
    return (
      <div className={styles.scheduledBadge({ eventType: eventTypeVariant })}>
        {renderEventIcon(item.purpose, styles.badgeIcon())}
        <div className={styles.badgeContent()}>
          <div className={styles.eventLabel()}>{getEventLabel(item.purpose)}</div>
          <div className={styles.teacherName()}>{item.teacherName}</div>
        </div>
      </div>
    );
  };

  const renderScheduledItems = () => {
    if (fullPeriodItem) {
      return renderScheduledBadge(fullPeriodItem);
    }

    return (
      <div className={styles.buttonArea()}>
        {/* First Half */}
        {firstHalfItem ? (
          renderScheduledBadge(firstHalfItem)
        ) : isHalfAvailableForSelected(ScheduleAssignment.FIRST_HALF) ? (
          <button
            onClick={() => handlePeriodPortionSelect(ScheduleAssignment.FIRST_HALF)}
            className={cn(
              styles.button({ portion: 'firstHalf' }),
              isScheduled(ScheduleAssignment.FIRST_HALF) ? "bg-blue-600 text-white" : ""
            )}
          >
            Schedule First Half
          </button>
        ) : null}

        {/* Second Half */}
        {secondHalfItem ? (
          renderScheduledBadge(secondHalfItem)
        ) : isHalfAvailableForSelected(ScheduleAssignment.SECOND_HALF) ? (
          <button
            onClick={() => handlePeriodPortionSelect(ScheduleAssignment.SECOND_HALF)}
            className={cn(
              styles.button({ portion: 'secondHalf' }),
              isScheduled(ScheduleAssignment.SECOND_HALF) ? "bg-blue-600 text-white" : ""
            )}
          >
            Schedule Second Half
          </button>
        ) : null}
      </div>
    );
  };

  return (
    <div className={cn(styles.container(), className)}>
      {dropZoneItems.length > 0 ? (
        renderScheduledItems()
      ) : isThisPeriodSelected ? (
        <div className="h-full flex gap-1 p-1">
          <div className="flex-1 flex flex-col gap-1">
            <button
              onClick={() => handlePeriodPortionSelect(ScheduleAssignment.FIRST_HALF)}
              className={cn(
                "flex-1 flex items-center justify-center rounded text-xs font-medium cursor-pointer transition-colors",
                isScheduled(ScheduleAssignment.FIRST_HALF) 
                  ? "bg-blue-600 text-white" 
                  : "bg-blue-500 text-white hover:bg-blue-600"
              )}
            >
              First
            </button>
            <button
              onClick={() => handlePeriodPortionSelect(ScheduleAssignment.SECOND_HALF)}
              className={cn(
                "flex-1 flex items-center justify-center rounded text-xs font-medium cursor-pointer transition-colors",
                isScheduled(ScheduleAssignment.SECOND_HALF) 
                  ? "bg-blue-600 text-white" 
                  : "bg-blue-500 text-white hover:bg-blue-600"
              )}
            >
              Second
            </button>
          </div>
          
          <button
            onClick={() => handlePeriodPortionSelect(ScheduleAssignment.FULL_PERIOD)}
            className={cn(
              "flex-1 flex items-center justify-center rounded text-xs font-medium cursor-pointer transition-colors",
              isScheduled(ScheduleAssignment.FULL_PERIOD) 
                ? "bg-blue-600 text-white" 
                : "bg-blue-500 text-white hover:bg-blue-600"
            )}
          >
            Full
          </button>
        </div>
      ) : (
        <div className={styles.emptyDropZone()}>
          Period {period}
        </div>
      )}
    </div>
  );
} 