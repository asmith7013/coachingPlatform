// src/app/dashboard/layout.tsx
'use client'

import { AppShell } from '@/components/composed/layouts'
import { 
  HomeIcon,
  BuildingLibraryIcon,
  UserGroupIcon,
  DocumentMagnifyingGlassIcon,
  CalendarDaysIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline'

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: true },
  { name: 'Schools', href: '/dashboard/schoolList', icon: BuildingLibraryIcon, current: false },
  { name: 'Staff', href: '/dashboard/staff/nycps', icon: UserGroupIcon, current: false },
  { name: 'Look Fors', href: '/dashboard/lookForList', icon: DocumentMagnifyingGlassIcon, current: false },
  { name: 'Schedules', href: '/dashboard/schedule', icon: CalendarDaysIcon, current: false },
  { name: 'Reports', href: '/reports', icon: ChartPieIcon, current: false },
]

const teamItems = [
  { id: 'math-coaches', name: 'Math Coaches', href: '#', initial: 'M', current: false },
  { id: 'ela-coaches', name: 'ELA Coaches', href: '#', initial: 'E', current: false },
  { id: 'admin-team', name: 'Admin Team', href: '#', initial: 'A', current: false },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      navigation={navigationItems}
      teams={teamItems}
      // logo={
      //   <div className="flex items-center">
      //     <span className="text-xl font-bold text-blue-600">Coaching Platform</span>
      //   </div>
      // }
    >
      {children}
    </AppShell>
  )
}