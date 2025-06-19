import { ErrorContext } from '@error-types';
import { createErrorContext } from '@error/core/context';

/**
 * Create error context for schedule feature operations
 */
export function createScheduleErrorContext(
  operation: string,
  metadata?: Record<string, unknown>
): ErrorContext {
  return createErrorContext('ScheduleFeature', operation, {
    category: 'business',
    metadata: {
      featureVersion: 'schedulesUpdated',
      ...metadata
    },
    tags: {
      'feature.name': 'scheduling',
      'feature.version': 'updated'
    }
  });
}

/**
 * Create error context for schedule data operations
 */
export function createScheduleDataErrorContext(
  operation: string,
  schoolId: string,
  date: string,
  additionalMetadata?: Record<string, unknown>
): ErrorContext {
  return createScheduleErrorContext(operation, {
    schoolId,
    date,
    ...additionalMetadata
  });
}

/**
 * Create error context for schedule conflict operations
 */
export function createScheduleConflictErrorContext(
  teacherId: string,
  periodNumber: number,
  additionalMetadata?: Record<string, unknown>
): ErrorContext {
  return createScheduleErrorContext('conflictDetection', {
    teacherId,
    periodNumber,
    severity: 'warning',
    ...additionalMetadata
  });
}

/**
 * Create error context for schedule transformation operations
 */
export function createScheduleTransformErrorContext(
  transformationType: string,
  dataSource: string,
  additionalMetadata?: Record<string, unknown>
): ErrorContext {
  return createScheduleErrorContext(`transform_${transformationType}`, {
    dataSource,
    category: 'validation',
    ...additionalMetadata
  });
}

/**
 * Error context for schedule UI operations
 */
export function createScheduleUIErrorContext(
  uiOperation: string,
  componentName: string,
  additionalMetadata?: Record<string, unknown>
): ErrorContext {
  return createErrorContext(`Schedule_${componentName}`, uiOperation, {
    category: 'system',
    severity: 'warning',
    metadata: {
      featureVersion: 'schedulesUpdated',
      uiComponent: componentName,
      ...additionalMetadata
    },
    tags: {
      'feature.name': 'scheduling',
      'ui.component': componentName
    }
  });
} 