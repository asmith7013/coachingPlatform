// Unified event styling system
export * from './event-styles'

// Re-export common styling utilities for easy access
export { 
  EVENT_COLOR_MAP,
  getEventColorClasses,
  getEventContainerClasses,
  getEventTextClasses,
  getEventAccentClasses,
  getEventPosition,
  formatEventDuration,
  formatEventTime,
  eventItem
} from './event-styles' 