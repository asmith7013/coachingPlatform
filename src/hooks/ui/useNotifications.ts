import { toast } from 'sonner';
import { ToastConfig } from '@/lib/ui/notifications/types';

/**
 * useNotifications - Hook for managing toast notifications
 * Provides a withToast utility for async operations
 */
export function useNotifications() {
  /**
   * Wraps an async operation with toast feedback
   */
  async function withToast<T>(
    operation: () => Promise<T>,
    config: ToastConfig,
    enabled: boolean = true
  ): Promise<T> {
    if (!enabled || typeof window === 'undefined') {
      return operation();
    }
    let toastId: string | number | undefined;
    try {
      if (config.loading) {
        toastId = toast.loading(config.loading);
      }
      const result = await operation();
      if (toastId && config.success) {
        toast.success(config.success, { id: toastId });
      } else if (config.success) {
        toast.success(config.success);
      }
      return result;
    } catch (error) {
      if (toastId && config.error) {
        toast.error(config.error, { id: toastId });
      } else if (config.error) {
        toast.error(config.error);
      }
      throw error;
    }
  }

  return {
    withToast,
    toast // direct access to sonner's toast API if needed
  };
} 