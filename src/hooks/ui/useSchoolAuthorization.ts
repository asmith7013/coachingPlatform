import { useMemo } from 'react'
import { useClerkContext } from '@/hooks/auth/useClerkContext'

export function useSchoolAuthorization() {
  const { user, organization, metadata } = useClerkContext()

  const authData = useMemo(() => {
    if (!user) return null

    // Extract school domain from email
    const email = user.primaryEmailAddress?.emailAddress || ''
    const domain = email.split('@')[1] || ''

    // Determine role based on email domain or metadata
    let role = metadata.roles[0] || 'teacher'

    // Auto-assign roles based on email domain patterns
    if (domain.includes('admin')) {
      role = 'admin'
    } else if (domain.includes('principal')) {
      role = 'principal'
    }

    // Get school ID from organization or user metadata
    const schoolId = organization?.id || metadata.schoolId

    return {
      role,
      domain,
      schoolId,
      isAuthorized: domain.endsWith('.edu') || domain.endsWith('.org')
    }
  }, [user, organization, metadata])

  return authData
} 