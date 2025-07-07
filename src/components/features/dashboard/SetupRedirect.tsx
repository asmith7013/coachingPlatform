'use client'

import { useAuthenticatedUser } from '@/hooks/auth/useAuthenticatedUser'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function SetupRedirect({ children }: { children: React.ReactNode }) {
  const { isSignedIn, metadata, isLoading } = useAuthenticatedUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isSignedIn && !metadata.staffId) {
      router.push('/setup')
    }
  }, [isLoading, isSignedIn, metadata.staffId, router])

  if (!isLoading && isSignedIn && !metadata.staffId) {
    return null // Redirecting
  }

  return <>{children}</>
}



