// src/app/dashboard/config.ts
import { 
    HomeIcon,
    BuildingLibraryIcon,
    UserGroupIcon,
    DocumentTextIcon,
    ClipboardDocumentListIcon,
    CalendarDaysIcon,
    StarIcon,
    AcademicCapIcon,
    BookOpenIcon
} from '@heroicons/react/24/outline'

import type { NavigationItem, TeamItem } from '@/components/composed/layouts/NavigationSidebar'
import { PERMISSIONS } from '@core-types/auth'

// Navigation configuration with proper permission constants
export const navigationItems: NavigationItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: HomeIcon, 
    current: false 
  },
  { 
    name: 'Schools', 
    href: '/dashboard/schoolList', 
    icon: BuildingLibraryIcon, 
    current: false,
    requiredPermissions: [PERMISSIONS.SCHOOLS_VIEW]
  },
  { 
    name: 'Classroom Notes',
    href: '/dashboard/classroomNotes',
    icon: DocumentTextIcon,
    current: false,
    requiredPermissions: [PERMISSIONS.NOTES_VIEW]
  },
  { 
    name: 'Look Fors', 
    href: '/dashboard/lookForList', 
    icon: ClipboardDocumentListIcon, 
    current: false,
    requiredPermissions: [PERMISSIONS.LOOKFORS_VIEW]
  },
  { 
    name: 'Schedule', 
    href: '/dashboard/schedule', 
    icon: CalendarDaysIcon, 
    current: false,
    requiredPermissions: [PERMISSIONS.SCHEDULE_VIEW]
  },
  { 
    name: 'Scoring', 
    href: '/dashboard/scoring', 
    icon: StarIcon, 
    current: false,
    requiredPermissions: [PERMISSIONS.SCORING_VIEW],
    requiredRoles: ['Coach', 'Administrator']
  },
  { 
    name: 'Staff', 
    href: '/dashboard/staff', 
    icon: UserGroupIcon, 
    current: false,
    requiredPermissions: [PERMISSIONS.STAFF_VIEW],
    children: [
      { 
        name: 'Teaching Lab', 
        href: '/dashboard/staff/teachingLab', 
        icon: BookOpenIcon, 
        current: false,
        requiredPermissions: [PERMISSIONS.STAFF_TEACHINGLAB_VIEW]
      },
      { 
        name: 'NYCPS Staff', 
        href: '/dashboard/staff/nycps', 
        icon: AcademicCapIcon, 
        current: false,
        requiredPermissions: [PERMISSIONS.STAFF_NYCPS_VIEW]
      }
    ]
  }
]

// Team configuration
export const teamItems: TeamItem[] = [
  { id: 'math-coaches', name: 'Math Coaches', href: '#', initial: 'M', current: false },
  { id: 'ela-coaches', name: 'ELA Coaches', href: '#', initial: 'E', current: false },
  { id: 'science-coaches', name: 'Science Coaches', href: '#', initial: 'S', current: false },
]

// Page metadata for dynamic titles/descriptions
export const pageMetadata: Record<string, { title: string; description: string }> = {
  '/dashboard': {
    title: 'Dashboard',
    description: 'Overview of your coaching activities'
  },
  '/dashboard/schoolList': {
    title: 'Schools',
    description: 'Manage and view all schools in your district'
  },
  '/dashboard/classroomNotes': {
    title: 'Classroom Notes',
    description: 'Document and review classroom observations'
  },
  '/dashboard/lookForList': {
    title: 'Look Fors',
    description: 'Track instructional priorities and focus areas'
  },
  '/dashboard/schedule': {
    title: 'Schedule',
    description: 'Manage your coaching visits and appointments'
  },
  '/dashboard/scoring': {
    title: 'Scoring',
    description: 'Evaluate and track instructional rubrics'
  },
  '/dashboard/staff/teachingLab': {
    title: 'Teaching Lab Staff',
    description: 'Manage Teaching Lab team members'
  },
  '/dashboard/staff/nycps': {
    title: 'NYCPS Staff',
    description: 'Manage NYC Public School staff'
  },
}