'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: false,
        capture_pageleave: true,
        // loaded: (posthog) => {
        //   if (process.env.NODE_ENV === 'development') {
        //     posthog.debug()
        //   }
        // },
      })
    }
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}

export function PostHogIdentifier() {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (isLoaded && user && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      // Identify user with Clerk data
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        createdAt: user.createdAt,
      })
    } else if (isLoaded && !user) {
      // Reset identity when user logs out
      posthog.reset()
    }
  }, [user, isLoaded])

  return null
}
