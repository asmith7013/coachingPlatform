// src/app/dashboard/config.ts
import { 
    HomeIcon,
    BuildingLibraryIcon,
    UserGroupIcon,
    DocumentMagnifyingGlassIcon,
    CalendarDaysIcon,
    // ChartPieIcon,
  } from '@heroicons/react/24/outline'
  
  export const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: true },
    { name: 'Schools', href: '/dashboard/schoolList', icon: BuildingLibraryIcon, current: false },
    { name: 'Staff', href: '/dashboard/staff/nycps', icon: UserGroupIcon, current: false },
    { name: 'Look Fors', href: '/dashboard/lookForList', icon: DocumentMagnifyingGlassIcon, current: false },
    { name: 'Schedules', href: '/dashboard/schedule', icon: CalendarDaysIcon, current: false },
  ]
  
  export const teamItems = [
    { id: 'math-coaches', name: 'Math Coaches', href: '#', initial: 'M', current: false },
    { id: 'ela-coaches', name: 'ELA Coaches', href: '#', initial: 'E', current: false },
    { id: 'admin-team', name: 'Admin Team', href: '#', initial: 'A', current: false },
  ]