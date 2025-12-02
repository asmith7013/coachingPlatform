'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { trackPageView, updatePageViewDuration } from '@/app/actions/analytics'

// Generate a session ID that persists across page loads
function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = sessionStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    sessionStorage.setItem('analytics_session_id', sessionId)
  }
  return sessionId
}

export function PageViewTracker() {
  const pathname = usePathname()
  const { user, isLoaded } = useUser()
  const [pageViewId, setPageViewId] = useState<string | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const pageViewIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return

    const sessionId = getSessionId()
    startTimeRef.current = Date.now()

    // Track page view
    const trackView = async () => {
      try {
        const result = await trackPageView({
          userId: user?.id,
          clerkId: user?.id,
          userEmail: user?.primaryEmailAddress?.emailAddress,
          sessionId,
          page: pathname,
          fullUrl: window.location.href,
          referrer: document.referrer || undefined,
          userAgent: navigator.userAgent,
        })

        if (result.success && result.data) {
          const id = result.data._id as string
          setPageViewId(id)
          pageViewIdRef.current = id
        }
      } catch (error) {
        console.error('Failed to track page view:', error)
      }
    }

    trackView()

    // Update duration when user leaves
    return () => {
      if (pageViewIdRef.current) {
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
        // Call the action (may not fire reliably on page unload)
        updatePageViewDuration(pageViewIdRef.current, duration).catch(console.error)
      }
    }
  }, [pathname, user?.id, user?.primaryEmailAddress?.emailAddress, isLoaded])

  // Track page visibility changes
  useEffect(() => {
    if (!pageViewId) return

    const handleVisibilityChange = () => {
      if (document.hidden && pageViewId) {
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
        updatePageViewDuration(pageViewId, duration).catch(console.error)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [pageViewId])

  return null
}
