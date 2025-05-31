// src/app/dashboard/layout.tsx
'use client'

import { AppShell } from '@/components/composed/layouts/AppShell'
import { teamItems } from './config'
import { useAuthorizedNavigation } from '@hooks/ui/useAuthorizedNavigation'
import { AuthGuard } from '@components/auth/AuthGuard'
import { PERMISSIONS } from '@core-types/auth'
import { useAuthenticatedUser } from '@hooks/auth/useAuthenticatedUser'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { isSignedIn, metadata, isLoading } = useAuthenticatedUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isSignedIn && !metadata.staffId) {
      // User is signed in but hasn't completed setup
      router.push('/setup')
    }
  }, [isLoading, isSignedIn, metadata.staffId, router])

  return (
    <AuthGuard requiredPermission={PERMISSIONS.DASHBOARD_VIEW}>
      <DashboardContent>{children}</DashboardContent>
    </AuthGuard>
  )
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  // Use authorized navigation for role/permission filtering
  const { navigation, pageInfo, breadcrumbs } = useAuthorizedNavigation()
  
  return (
    <AppShell
      navigation={navigation}
      teams={teamItems}
      pageTitle={pageInfo.title}
      pageDescription={pageInfo.description}
      breadcrumbs={breadcrumbs}
      showTeams={true}
    >
      {children}
    </AppShell>
  )
}