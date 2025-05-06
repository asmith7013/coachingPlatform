import { BaseResponse } from '@core-types/response';

/**
 * Import item interface for providing additional data when importing
 */
export interface ImportItem {
  id: string;
  ownerId?: string;
  completeData?: Record<string, unknown>;
}

/**
 * Import preview for Monday.com items
 */
export interface ImportPreview {
  original: Record<string, unknown>;
  transformed: Record<string, unknown>;
  valid: boolean;
  existingItem?: Record<string, unknown>;
  isDuplicate: boolean;
  missingRequired: string[];
  errors: Record<string, string>;
  requiredForFinalValidation?: string[];
}

/**
 * Import result from Monday.com items
 */
export interface ImportResult extends Pick<BaseResponse, 'success' | 'message'> {
  success: boolean;
  imported: number;
  errors: Record<string, string>;
  message?: string;
  data?: {
    visitData?: Record<string, unknown>;
    missingFields?: string[];
  };
}

/**
 * Define the preview item type
 */
export interface VisitImportItem {
  id: string;
  name: string;
  date?: string;
  school?: string;
  coach?: string;
  isDuplicate?: boolean;
  isValid?: boolean;
  owners?: string[];
  [key: string]: unknown;
}