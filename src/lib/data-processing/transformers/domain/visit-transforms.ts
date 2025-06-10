import React from 'react';
import type { Visit } from '@zod-schema/visits/visit';
import { EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
import { formatMediumDate, toDateString } from '@/lib/data-processing/transformers/utils/date-utils';

// Define the InfoCard props type based on the component interface
interface InfoCardProps {
  title: string;
  avatar?: {
    src: string;
    alt: string;
  };
  details: Array<{
    label: string;
    value: string | React.ReactNode;
    badge?: {
      text: string;
      variant?: 'success' | 'info' | 'warning' | 'danger' | 'neutral';
    };
  }>;
  actions?: Array<{
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
    href?: string;
  }>;
  menuActions?: Array<{
    label: string;
    onClick?: () => void;
    href?: string;
  }>;
  className?: string;
}

/**
 * Transform visit to InfoCard props format
 */
export function visitToInfoCardTransformer(
  visit: Visit,
  actions: {
    onView: () => void;
    onEdit: () => void;
  }
): Omit<InfoCardProps, 'size'> {
  const visitDate = visit.date ? new Date(visit.date) : null;
  
  return {
    title: visitDate ? formatMediumDate(toDateString(visitDate)) : 'No Date',
    avatar: {
      src: `https://ui-avatars.com/api/?name=${encodeURIComponent(visit.coachId || 'Coach')}&background=0ea5e9&color=fff`,
      alt: visit.coachId || 'Coach'
    },
    details: [
      {
        label: 'Coach',
        value: visit.coachId || 'Unknown'
      },
      {
        label: 'Purpose',
        value: visit.allowedPurpose || 'Visit'
      },
      {
        label: 'Mode',
        value: visit.modeDone || 'In-person',
        badge: {
          text: visit.modeDone || 'In-person',
          variant: getVisitModeVariant(visit.modeDone)
        }
      },
      {
        label: 'Events',
        value: `${visit.events?.length || 0} scheduled`
      },
      {
        label: 'Grade Levels',
        value: visit.gradeLevelsSupported?.join(', ') || 'All grades'
      }
    ],
    actions: [
      {
        label: 'View Details',
        icon: React.createElement(EyeIcon, { className: "h-5 w-5" }),
        onClick: actions.onView
      },
      {
        label: 'Edit Visit',
        icon: React.createElement(PencilIcon, { className: "h-5 w-5" }),
        onClick: actions.onEdit
      }
    ],
    menuActions: [
      {
        label: 'Duplicate Visit',
        onClick: () => console.log('Duplicate visit:', visit._id)
      },
      {
        label: 'Delete Visit',
        onClick: () => console.log('Delete visit:', visit._id)
      }
    ]
  };
}

/**
 * Helper function for visit mode badge variants
 */
function getVisitModeVariant(mode?: string): 'success' | 'info' | 'warning' | 'danger' | 'neutral' {
  switch (mode) {
    case 'Virtual': return 'info';
    case 'Hybrid': return 'warning';
    case 'In-person': return 'success';
    default: return 'neutral';
  }
}

/**
 * Transform visit for summary display
 */
export function visitToSummaryTransformer(visit: Visit) {
  const visitDate = visit.date ? new Date(visit.date) : null;
  
  return {
    id: visit._id,
    title: visitDate ? formatMediumDate(toDateString(visitDate)) : 'No Date',
    coach: visit.coachId || 'Unknown',
    purpose: visit.allowedPurpose || 'Visit',
    mode: visit.modeDone || 'In-person',
    eventsCount: visit.events?.length || 0,
    gradeLevel: visit.gradeLevelsSupported?.join(', ') || 'All grades',
    date: visitDate,
    badgeVariant: getVisitModeVariant(visit.modeDone)
  };
}

/**
 * Transform multiple visits to InfoCard format
 */
export function visitCollectionToInfoCards(
  visits: Visit[],
  actionFactory: (visit: Visit) => { onView: () => void; onEdit: () => void }
): Array<Omit<InfoCardProps, 'size'>> {
  return visits.map(visit => visitToInfoCardTransformer(visit, actionFactory(visit)));
} 