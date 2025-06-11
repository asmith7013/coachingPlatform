import { cn } from '@ui/utils/formatters';
/**
 * Form Styling and Layout System
 * Provides consistent styling utilities for TanStack forms
 * Integrates with existing design tokens and Card component patterns
 */

/**
 * Standard form layout classes
 * Uses existing design tokens for consistency
 */
export const resourceFormStyles = () => ({
  // Main form container
  container: "w-full max-w-4xl mx-auto",
  
  // Form sections
  section: "space-y-6 mb-8",
  sectionTitle: "text-lg font-semibold text-gray-900 mb-4",
  sectionDescription: "text-sm text-gray-600 mb-6",
  
  // Field layouts
  fieldGrid: "grid grid-cols-1 md:grid-cols-2 gap-6",
  fieldGridFull: "grid grid-cols-1 gap-6",
  fieldGroup: "space-y-4",
  
  // Field spacing
  field: "mb-4",
  fieldLarge: "mb-6",
  
  // Form actions
  actions: "flex items-center justify-end space-x-4 pt-6 border-t border-gray-200",
  actionsLeft: "flex items-center justify-start space-x-4 pt-6 border-t border-gray-200",
  actionsBetween: "flex items-center justify-between pt-6 border-t border-gray-200",
  
  // Loading and states
  loading: "opacity-50 pointer-events-none",
  disabled: "opacity-60 cursor-not-allowed",
  
  // Responsive utilities
  responsive: {
    mobile: "block md:hidden",
    desktop: "hidden md:block",
    stack: "flex flex-col space-y-4",
    inline: "flex items-center space-x-4"
  }
});

/**
 * Form layout utilities for different form types
 */
export const formLayouts = {
  // Single column layout for simple forms
  simple: {
    container: "max-w-md mx-auto",
    fields: "space-y-4",
    actions: "mt-6 flex justify-end space-x-3"
  },
  
  // Two column layout for complex forms
  standard: {
    container: "max-w-4xl mx-auto",
    fields: "grid grid-cols-1 md:grid-cols-2 gap-6",
    actions: "mt-8 flex justify-end space-x-3 col-span-full"
  },
  
  // Wide layout for forms with many fields
  wide: {
    container: "max-w-6xl mx-auto",
    fields: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    actions: "mt-8 flex justify-end space-x-3 col-span-full"
  },
  
  // Stepped/wizard layout
  stepped: {
    container: "max-w-2xl mx-auto",
    step: "min-h-[400px]",
    fields: "space-y-6",
    actions: "flex justify-between items-center mt-8 pt-6 border-t border-gray-200"
  }
};

/**
 * Field-specific styling utilities
 */
export const fieldStyles = {
  // Reference field containers
  reference: "relative",
  referenceDropdown: "absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg",
  
  // Grouped fields
  group: "p-4 border border-gray-200 rounded-lg bg-gray-50",
  groupTitle: "font-medium text-gray-900 mb-3",
  
  // Inline field arrangements  
  inline: "flex items-end space-x-4",
  inlineLabel: "flex-shrink-0 w-24 text-sm font-medium text-gray-700",
  
  // Error states
  error: "border-red-300 focus:border-red-500 focus:ring-red-500",
  errorText: "mt-1 text-sm text-red-600",
  
  // Success states
  success: "border-green-300 focus:border-green-500 focus:ring-green-500",
  
  // Disabled states
  disabled: "bg-gray-100 cursor-not-allowed opacity-60"
};

/**
 * Form section utilities for organizing complex forms
 */
export const sectionStyles = {
  // Basic section
  section: "mb-8",
  
  // Collapsible section
  collapsible: "border border-gray-200 rounded-lg",
  collapsibleHeader: "p-4 bg-gray-50 cursor-pointer flex items-center justify-between",
  collapsibleContent: "p-4 border-t border-gray-200",
  collapsibleIcon: "w-5 h-5 text-gray-400 transition-transform duration-200",
  
  // Card-based section (integrates with existing Card component)
  card: "bg-white border border-gray-200 rounded-lg p-6 shadow-sm",
  cardHeader: "mb-6 pb-4 border-b border-gray-200",
  cardTitle: "text-lg font-semibold text-gray-900",
  cardDescription: "mt-1 text-sm text-gray-600",
  
  // Tabs-based sections
  tabs: "border-b border-gray-200",
  tabsList: "flex space-x-8",
  tab: "py-2 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300",
  tabActive: "border-blue-500 text-blue-600"
};

/**
 * Animation utilities for form interactions
 */
export const animationStyles = {
  // Fade transitions
  fadeIn: "animate-in fade-in duration-200",
  fadeOut: "animate-out fade-out duration-200",
  
  // Slide transitions
  slideIn: "animate-in slide-in-from-right duration-300",
  slideOut: "animate-out slide-out-to-right duration-300",
  
  // Scale transitions
  scaleIn: "animate-in zoom-in-95 duration-200",
  scaleOut: "animate-out zoom-out-95 duration-200",
  
  // Loading states
  pulse: "animate-pulse",
  spin: "animate-spin"
};
/**
 * Generate responsive form classes based on form type
 */
export function getFormClasses(type: 'simple' | 'standard' | 'wide' | 'stepped' = 'standard') {
  const layout = formLayouts[type];
  const base = resourceFormStyles();
  
  return {
    container: cn(base.container, layout.container),
    fields: layout.fields,
    actions: layout.actions
  };
} 