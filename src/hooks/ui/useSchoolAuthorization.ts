import { useUser, useOrganization } from '@clerk/nextjs'
import { useMemo } from 'react'

export function useSchoolAuthorization() {
  const { user } = useUser()
  const { organization } = useOrganization()
  
  const authData = useMemo(() => {
    if (!user) return null
    
    // Extract school domain from email
    const email = user.primaryEmailAddress?.emailAddress || ''
    const domain = email.split('@')[1] || ''
    
    // Determine role based on email domain or metadata
    let role = (user.publicMetadata.role as string) || 'teacher'
    
    // Auto-assign roles based on email domain patterns
    if (domain.includes('admin')) {
      role = 'admin'
    } else if (domain.includes('principal')) {
      role = 'principal'
    }
    
    // Get school ID from organization or user metadata
    const schoolId = organization?.id || (user.publicMetadata.schoolId as string)
    
    return {
      role,
      domain,
      schoolId,
      isAuthorized: domain.endsWith('.edu') || domain.endsWith('.org')
    }
  }, [user, organization])
  
  return authData
} 