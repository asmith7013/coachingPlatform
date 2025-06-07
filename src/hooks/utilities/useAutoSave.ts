import { useCallback, useRef, useEffect, useMemo } from 'react'
import { debounce } from 'lodash'

export interface AutoSaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error'
  lastSaved?: Date
  error?: string
}

export interface UseAutoSaveOptions {
  /** The unique identifier for the entity being saved */
  entityId: string
  /** The data to save */
  data: unknown
  /** Function to call when saving */
  onSave: (entityId: string, data: unknown) => Promise<void>
  /** Debounce delay in milliseconds (default: 2000) */
  debounceMs?: number
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean
  /** Maximum retry attempts on error (default: 3) */
  maxRetries?: number
}

/**
 * Auto-save hook with debounced saving
 * 
 * Features:
 * - 2-second debounced saving (configurable)
 * - Invisible to users (no loading indicators required)
 * - Error handling with retry logic
 * - Proper cleanup on unmount
 * - Last-write-wins conflict resolution
 * 
 * @example
 * ```tsx
 * const { triggerSave, status } = useAutoSave({
 *   entityId: planId,
 *   data: editingData,
 *   onSave: async (id, data) => {
 *     await updateCoachingActionPlanPartial(id, data)
 *   }
 * })
 * 
 * // Trigger save when data changes
 * useEffect(() => {
 *   if (hasChanges) {
 *     triggerSave()
 *   }
 * }, [editingData, hasChanges, triggerSave])
 * ```
 */
export function useAutoSave({
  entityId,
  data,
  onSave,
  debounceMs = 2000,
  enabled = true,
  maxRetries = 3
}: UseAutoSaveOptions) {
  // Status tracking (internal - not exposed to UI)
  const statusRef = useRef<AutoSaveStatus>({ status: 'idle' })
  const retryCountRef = useRef(0)
  const isMountedRef = useRef(true)
  
  // Store current data in ref to avoid dependency issues
  const dataRef = useRef(data)

  // Update data ref when data changes
  useEffect(() => {
    dataRef.current = data
  }, [data])

  // Create debounced save function (data removed from dependencies)
  const debouncedSave = useMemo(
    () => debounce(async () => {
      if (!enabled || !isMountedRef.current) {
        return
      }

      try {
        statusRef.current = { status: 'saving' }
        
        // Use current data from ref
        await onSave(entityId, dataRef.current)
        
        if (isMountedRef.current) {
          statusRef.current = { 
            status: 'saved', 
            lastSaved: new Date() 
          }
          retryCountRef.current = 0 // Reset retry count on success
        }
      } catch (error) {
        if (!isMountedRef.current) {
          return
        }

        const errorMessage = error instanceof Error ? error.message : 'Auto-save failed'
        
        // Silent error logging (no user interruption)
        console.error('Auto-save error:', {
          entityId,
          error: errorMessage,
          retryCount: retryCountRef.current
        })

        // Retry logic
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++
          // Exponential backoff: 1s, 2s, 4s
          const backoffDelay = Math.pow(2, retryCountRef.current - 1) * 1000
          
          setTimeout(() => {
            if (isMountedRef.current) {
              debouncedSave()
            }
          }, backoffDelay)
        } else {
          // Max retries exceeded - update status but don't interrupt user
          statusRef.current = { 
            status: 'error', 
            error: errorMessage 
          }
          retryCountRef.current = 0 // Reset for next save attempt
        }
      }
    }, debounceMs),
    [entityId, onSave, enabled, debounceMs, maxRetries] // data removed
  )

  // Trigger save function (data removed from dependencies)
  const triggerSave = useCallback(() => {
    if (enabled && entityId && dataRef.current) {
      debouncedSave()
    }
  }, [enabled, entityId, debouncedSave]) // data removed

  // Get current status (for debugging/monitoring - not for UI)
  const getStatus = useCallback((): AutoSaveStatus => {
    return { ...statusRef.current }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    
    return () => {
      isMountedRef.current = false
      debouncedSave.cancel() // Cancel pending debounced calls
    }
  }, [debouncedSave])

  // Reset retry count when entity or data changes significantly
  useEffect(() => {
    retryCountRef.current = 0
  }, [entityId])

  return {
    triggerSave,
    getStatus, // For debugging/monitoring only - not for UI
    // Note: No status exposed for UI - auto-save should be invisible
  }
} 