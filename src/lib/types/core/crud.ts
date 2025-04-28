  
  /**
   * Standardized result interface for bulk operations
   */
  export interface BulkUploadResult<T = unknown> {
    success: boolean;
    message?: string;
    error?: string;   // For backward compatibility
    errors?: Array<{
      item?: unknown;
      error: string;
    }>;
    items?: T[];
    total?: number;
  }
  
  
  /**
   * Basic CRUD result interface
   */
  export interface CrudResultType<T> {
    success: boolean;
    data?: T;
    error?: string;        // For backward compatibility
    errors?: Array<{       // New standard format
      item?: unknown;
      error: string;
    }>;
    message?: string;
  } 