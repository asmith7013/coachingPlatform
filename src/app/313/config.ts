import { 
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'

import type { NavigationItem, TeamItem } from '@/components/composed/layouts/sidebar/NavigationSidebar'
import { PERMISSIONS } from '@core-types/auth'

// 313 Summer Program Navigation
export const navigationItems: NavigationItem[] = [
  { 
    name: '313 Home', 
    href: '/313', 
    icon: HomeIcon, 
    current: false 
  },
  { 
    name: 'Students', 
    href: '/313/students', 
    icon: UserGroupIcon, 
    current: false,
    requiredPermissions: [PERMISSIONS.STAFF_VIEW] // Using existing permission for student data access
  },
  { 
    name: 'Analytics', 
    href: '/313/analytics', 
    icon: ChartBarIcon, 
    current: false,
    requiredPermissions: [PERMISSIONS.ANALYTICS_VIEW]
  },
  { 
    name: 'Reports', 
    href: '/313/reports', 
    icon: DocumentChartBarIcon, 
    current: false,
    requiredPermissions: [PERMISSIONS.REPORTS_VIEW]
  },
  { 
    name: 'Curriculum', 
    href: '/313/curriculum', 
    icon: BookOpenIcon, 
    current: false,
    requiredPermissions: [PERMISSIONS.DASHBOARD_VIEW] // Using basic dashboard permission for curriculum access
  }
]

// 313 Summer Program Teams (districts)
export const teamItems: TeamItem[] = [
  { id: 'd9', name: 'District 9', href: '/313?district=D9', initial: '9', current: false },
  { id: 'd11', name: 'District 11', href: '/313?district=D11', initial: '11', current: false },
]

// 313 Page metadata for dynamic titles/descriptions
export const pageMetadata: Record<string, { title: string; description: string }> = {
  '/313': {
    title: '313 Summer Program',
    description: 'Dashboard for 313 Summer Program management'
  },
  '/313/students': {
    title: 'Students',
    description: 'Manage and view all summer program students'
  },
  '/313/analytics': {
    title: 'Analytics',
    description: 'View summer program analytics and performance metrics'
  },
  '/313/reports': {
    title: 'Reports',
    description: 'Generate and view summer program reports'
  },
  '/313/curriculum': {
    title: 'Curriculum',
    description: 'Manage summer program curriculum and materials'
  }
} 