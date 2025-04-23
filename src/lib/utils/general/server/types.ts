export interface ResourceResponse<T = Record<string, unknown>> {
  items: T[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  success: boolean;
}

export interface ValidationError {
  message: string;
  path: string[];
} 