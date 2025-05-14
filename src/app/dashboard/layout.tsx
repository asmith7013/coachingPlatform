// src/app/dashboard/layout.tsx
'use client'

import { AppShell } from '@/components/composed/layouts/AppShell'
import { teamItems } from './config'
import { useAuthorizedNavigation } from '@/hooks/ui/useAuthorizedNavigation'
import { Breadcrumbs } from '@/components/composed/navigation/Breadcrumbs'

export default function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // Use authorized navigation for role/permission filtering
  const { navigation, pageInfo, breadcrumbs } = useAuthorizedNavigation()
  
  return (
    <AppShell
      navigation={navigation}
      teams={teamItems}
      pageTitle={pageInfo.title}
      pageDescription={pageInfo.description}
      showTeams={true}
      logo={{
        src: '/logo.svg',
        alt: 'Coaching Platform'
      }}
    >
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        {children}
      </div>
    </AppShell>
  )
}