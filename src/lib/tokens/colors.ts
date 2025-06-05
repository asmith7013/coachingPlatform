// src/lib/ui/tokens/colors.ts

// Text color tokens
export const textColors = {
  default: 'text-secondary',
  muted: 'text-muted',
  mutedForeground: 'text-gray-400',
  accent: 'text-accent',
  primary: 'text-primary',
  secondary: 'text-secondary',
  danger: 'text-danger',
  success: 'text-success',
  surface: 'text-surface',
  background: 'text-background',
  border: 'text-border',

  // Explicit white and black for high contrast needs
  white: 'text-white',
  black: 'text-black',

  // Dark mode variants
  dark: {
    default: 'dark:text-default',
    muted: 'dark:text-muted',
    accent: 'dark:text-accent-300',
    primary: 'dark:text-primary-300',
    secondary: 'dark:text-secondary-300',
    danger: 'dark:text-danger-300',
    success: 'dark:text-success-300',
    surface: 'dark:text-surface-200',
    background: 'dark:text-background',
    border: 'dark:text-border-300'
  },

  // Combined tokens
  combined: {
    default: 'text-default dark:text-surface',
    muted: 'text-muted dark:text-muted',
    accent: 'text-accent dark:text-accent-300',
    primary: 'text-primary dark:text-primary-300',
    secondary: 'text-secondary dark:text-secondary-300',
    danger: 'text-danger dark:text-danger-300',
    success: 'text-success dark:text-success-300'
  }
};

// Background color tokens
export const backgroundColors = {
  default: 'bg-default',
  muted: 'bg-muted-100',
  primary: 'bg-primary-400',
  secondary: 'bg-secondary-400',
  danger: 'bg-danger-400',
  success: 'bg-success-400',
  surface: 'bg-surface',
  subtle: 'bg-subtle-100',
  white: 'bg-white',

  // Light variants for backgrounds (higher numbers = darker)
  light: {
    primary: 'bg-primary-50/40',
    secondary: 'bg-secondary-50/40',
    danger: 'bg-danger-50/40',
    success: 'bg-success-50/40',
    muted: 'bg-muted-50/40',
    surface: 'bg-surface-50/40'
  },

  // Dark mode variants
  dark: {
    default: 'dark:bg-default-900',
    muted: 'dark:bg-muted-800',
    primary: 'dark:bg-primary-700',
    secondary: 'dark:bg-secondary-700',
    danger: 'dark:bg-danger-700',
    success: 'dark:bg-success-700',
    surface: 'dark:bg-surface-800',
    subtle: 'dark:bg-subtle-900'
  },

  // Combined tokens
  combined: {
    default: 'bg-default dark:bg-default-900',
    muted: 'bg-muted-100 dark:bg-muted-800',
    primary: 'bg-primary-400 dark:bg-primary-700',
    secondary: 'bg-secondary-400 dark:bg-secondary-700',
    danger: 'bg-danger-400 dark:bg-danger-700',
    success: 'bg-success-400 dark:bg-success-700',
    surface: 'bg-surface dark:bg-surface-800',
    subtle: 'bg-subtle-100 dark:bg-subtle-900'
  }
};

// Border color tokens
export const borderColors = {
  default: 'border-default',
  muted: 'border-muted-200',
  primary: 'border-primary-200',
  secondary: 'border-secondary-200',
  danger: 'border-danger-200',
  success: 'border-success-200',
  surface: 'border-surface-300',

  // Light variants for borders (higher numbers = darker)
  light: {
    primary: 'border-primary-100',
    secondary: 'border-secondary-100',
    danger: 'border-danger-100',
    success: 'border-success-100',
    muted: 'border-muted-100',
    surface: 'border-surface-100'
  },

  // Dark mode variants
  dark: {
    default: 'dark:border-default-700',
    muted: 'dark:border-muted-700',
    primary: 'dark:border-primary-700',
    secondary: 'dark:border-secondary-700',
    danger: 'dark:border-danger-700',
    success: 'dark:border-success-700',
    surface: 'dark:border-surface-600'
  },

  // Combined tokens
  combined: {
    default: 'border-default dark:border-default-700',
    muted: 'border-muted-200 dark:border-muted-700',
    primary: 'border-primary-200 dark:border-primary-700',
    secondary: 'border-secondary-200 dark:border-secondary-700',
    danger: 'border-danger-200 dark:border-danger-700',
    success: 'border-success-200 dark:border-success-700',
    surface: 'border-surface-300 dark:border-surface-600'
  }
};

// Ring/Focus color tokens
export const ringColors = {
  default: 'ring-default',
  primary: 'ring-primary-400',
  secondary: 'ring-secondary-400',
  danger: 'ring-danger-400',
  success: 'ring-success-400',

  // Light variants for rings (higher numbers = darker)
  light: {
    primary: 'ring-primary-300',
    secondary: 'ring-secondary-300',
    danger: 'ring-danger-300',
    success: 'ring-success-300',
    muted: 'ring-muted-300'
  },

  // Dark mode variants
  dark: {
    default: 'dark:ring-default-700',
    primary: 'dark:ring-primary-500',
    secondary: 'dark:ring-secondary-500',
    danger: 'dark:ring-danger-500',
    success: 'dark:ring-success-500'
  },

  // Combined tokens
  combined: {
    default: 'ring-default dark:ring-default-700',
    primary: 'ring-primary-400 dark:ring-primary-500',
    secondary: 'ring-secondary-400 dark:ring-secondary-500',
    danger: 'ring-danger-400 dark:ring-danger-500',
    success: 'ring-success-400 dark:ring-success-500'
  }
};

// Text hover color tokens
export const hoverTextColors = {
  default: 'hover:text-default-700',
  primary: 'hover:text-primary-700',
  secondary: 'hover:text-secondary-700',
  danger: 'hover:text-danger-700',
  success: 'hover:text-success-700',

  // Dark mode variants
  dark: {
    default: 'dark:hover:text-default',
    primary: 'dark:hover:text-primary-200',
    secondary: 'dark:hover:text-secondary-200',
    danger: 'dark:hover:text-danger-200',
    success: 'dark:hover:text-success-200'
  },

  // Combined tokens
  combined: {
    default: 'hover:text-default-700 dark:hover:text-default',
    primary: 'hover:text-primary-700 dark:hover:text-primary-200',
    secondary: 'hover:text-secondary-700 dark:hover:text-secondary-200',
    danger: 'hover:text-danger-700 dark:hover:text-danger-200',
    success: 'hover:text-success-700 dark:hover:text-success-200'
  }
};

// Background hover color tokens
export const hoverBackgroundColors = {
  default: 'hover:bg-default-100',
  primary: 'hover:bg-primary-200',
  secondary: 'hover:bg-secondary-200',
  danger: 'hover:bg-danger-100',
  success: 'hover:bg-success-100',

  // Light variants for hover backgrounds (higher numbers = darker)
  light: {
    primary: 'hover:bg-primary-300',
    secondary: 'hover:bg-secondary-300',
    danger: 'hover:bg-danger-300',
    success: 'hover:bg-success-300',
    muted: 'hover:bg-gray-50'
  },

  // Dark mode variants
  dark: {
    default: 'dark:hover:bg-default-800',
    primary: 'dark:hover:bg-primary-800',
    secondary: 'dark:hover:bg-secondary-800',
    danger: 'dark:hover:bg-danger-800',
    success: 'dark:hover:bg-success-800'
  },

  // Combined tokens
  combined: {
    default: 'hover:bg-default-100 dark:hover:bg-default-800',
    primary: 'hover:bg-primary-200 dark:hover:bg-primary-800',
    secondary: 'hover:bg-secondary-200 dark:hover:bg-secondary-800',
    danger: 'hover:bg-danger-100 dark:hover:bg-danger-800',
    success: 'hover:bg-success-100 dark:hover:bg-success-800'
  }
};

export const hoverBorderColors = {
  default: 'hover:border-default-100',
  primary: 'hover:border-primary-200',
  secondary: 'hover:border-secondary-200',
  danger: 'hover:border-danger-100',
  success: 'hover:border-success-100',
  muted: 'hover:border-muted-200'
};

// Fully combined semantic colors
export const semanticColors = {
  text: textColors.combined,
  bg: backgroundColors.combined,
  border: borderColors.combined,
  ring: ringColors.combined,
  hoverText: hoverTextColors.combined,
  hoverBg: hoverBackgroundColors.combined
};