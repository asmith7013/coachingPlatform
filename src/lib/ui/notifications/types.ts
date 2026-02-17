// Toast configuration types for the notification system

export interface ToastConfig {
  loading?: string;
  success?: string;
  error?: string;
}

export interface EntityToastConfig {
  create?: ToastConfig;
  update?: ToastConfig;
  delete?: ToastConfig;
}

export const FEATURE_FLAGS = {
  ENABLE_TOASTS: process.env.NODE_ENV !== "test",
  TOAST_POSITION: "top-right" as const,
};
