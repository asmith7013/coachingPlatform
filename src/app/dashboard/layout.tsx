'use client'

import { DashboardShell } from '@components/features/dashboard/DashboardShell'

export default function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  )
}