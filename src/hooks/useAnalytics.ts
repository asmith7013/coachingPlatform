'use client'

import { usePostHog } from 'posthog-js/react'
import { useCallback } from 'react'

/**
 * Custom hook for analytics tracking
 * Provides a unified interface for tracking events across multiple platforms
 */
export function useAnalytics() {
  const posthog = usePostHog()

  /**
   * Track a custom event
   */
  const trackEvent = useCallback(
    (eventName: string, properties?: Record<string, unknown>) => {
      // Track in PostHog if available
      if (posthog) {
        posthog.capture(eventName, properties)
      }

      // You can add other analytics platforms here
      // e.g., Google Analytics, Mixpanel, etc.
    },
    [posthog]
  )

  /**
   * Track a conversion event
   */
  const trackConversion = useCallback(
    (conversionName: string, value?: number, properties?: Record<string, unknown>) => {
      trackEvent('conversion', {
        conversion_name: conversionName,
        value,
        ...properties,
      })
    },
    [trackEvent]
  )

  /**
   * Track a feature usage
   */
  const trackFeatureUsage = useCallback(
    (featureName: string, properties?: Record<string, unknown>) => {
      trackEvent('feature_used', {
        feature_name: featureName,
        ...properties,
      })
    },
    [trackEvent]
  )

  /**
   * Track an error
   */
  const trackError = useCallback(
    (errorMessage: string, properties?: Record<string, unknown>) => {
      trackEvent('error_occurred', {
        error_message: errorMessage,
        ...properties,
      })
    },
    [trackEvent]
  )

  return {
    trackEvent,
    trackConversion,
    trackFeatureUsage,
    trackError,
  }
}

// Example usage:
// const { trackEvent, trackFeatureUsage } = useAnalytics()
// trackEvent('button_clicked', { button_name: 'submit' })
// trackFeatureUsage('roadmap_completed', { roadmapId: '123' })
