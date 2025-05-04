// src/components/core/feedback/Alert.tsx
import React, { createContext, useContext } from 'react';
import { tv } from 'tailwind-variants';
import { cn } from '@ui/utils/formatters';
import { radii, textSize, borderWidths } from '@ui-tokens/tokens';
import { backgroundColors, borderColors, textColors } from '@ui-tokens/colors';
import { responsiveLayoutVariant } from '@ui-variants/layout';

// Define types for the context
type AlertContextType = {
  styles: ReturnType<typeof alertVariants>;
};

/**
 * Alert component variants using the centralized responsive layout system.
 * Leverages responsiveLayoutVariant for consistent responsive behavior.
 */
const alertVariants = tv({
    slots: {
      // Use the responsive layout slot for the root, with additional styling
      root: `relative w-full ${radii.lg} ${borderWidths.sm} p-4`,
      // Use the responsive title styling
      title: `${textSize.base} font-bold leading-none tracking-tight`,
      // Use the responsive content styling
      description: `${textSize.sm} [&_p]:leading-relaxed`,
    },
    variants: {
      intent: {
        primary: { 
          root: `border-2 ${borderColors.primary} ${backgroundColors.light.primary} ${textColors.primary}`,
          title: textColors.primary,
          description: textColors.muted
        },
        success: { 
          root: `border-2 ${borderColors.success} ${backgroundColors.light.success} ${textColors.default}`,
          title: textColors.success,
          description: textColors.success 
        },
        warning: { 
          root: `border-2 ${borderColors.danger} ${backgroundColors.light.danger} ${textColors.default}`,
          title: textColors.default,
          description: textColors.muted
        },
        error: { 
          root: `border-2 ${borderColors.danger} ${backgroundColors.light.danger} ${textColors.default}`,
          title: textColors.danger,
          description: textColors.muted
        },
        info: { 
          root: `border-2 ${borderColors.primary} ${backgroundColors.light.primary} ${textColors.primary}`,
          title: textColors.default,
          description: textColors.default
        },
        danger: {
          root: `border-2 ${borderColors.danger} ${backgroundColors.light.danger} ${textColors.danger}`,
          title: textColors.danger,
          description: textColors.muted
        },
      },
      appearance: {
        solid: '',
        alt: '',
        outline: '',
      },
      layout: {
        stacked: {
          root: responsiveLayoutVariant({ stack: 'always' }).container(),
          title: responsiveLayoutVariant({ stack: 'always', titleSpacing: 'normal' }).title(),
          description: responsiveLayoutVariant({ stack: 'always', contentWidth: 'full' }).content(),
        },
        responsive: {
          root: responsiveLayoutVariant({ stack: 'responsive' }).container(),
          title: responsiveLayoutVariant({ stack: 'responsive', titleSpacing: 'responsive' }).title(),
          description: responsiveLayoutVariant({ stack: 'responsive', contentWidth: 'responsive' }).content(),
        },
      },
    },
    compoundVariants: [
      {
        intent: "danger",
        appearance: "outline",
        root: "border-2 border-danger bg-light-danger text-danger",
        title: textColors.danger,
        description: textColors.muted
      },
      {
        intent: "success",
        appearance: "outline",
        root: "border-2 border-success bg-light-success text-success",
        title: textColors.success,
        description: textColors.muted
      },
    ],
    // Import the responsive layout variants
    defaultVariants: {
      intent: "primary",
      appearance: "solid",
      layout: "responsive",
    },
});

// Create context to share styles between components
const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Hook to use alert context in subcomponents
const useAlertContext = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("Alert subcomponents must be used within an Alert component");
  }
  return context;
};

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  intent?: "primary" | "success" | "warning" | "error" | "info";
  appearance?: "solid" | "alt" | "outline";
  /**
   * Layout variant for responsive behavior
   * - stacked: Always displays in a column layout
   * - responsive: Uses column layout on mobile, row layout on desktop
   * @default "responsive"
   */
  layout?: "stacked" | "responsive";
}

/**
 * Alert title component
 */
const AlertTitle = React.forwardRef
  <HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const { styles } = useAlertContext();
  return (
    <h5
      ref={ref}
      className={cn(styles.title(), className)}
      {...props}
    />
  );
});

AlertTitle.displayName = "AlertTitle";

/**
 * Alert description component
 */
const AlertDescription = React.forwardRef
  <HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { styles } = useAlertContext();
  return (
    <div
      ref={ref}
      className={cn(styles.description(), className)}
      {...props}
    />
  );
});

AlertDescription.displayName = "AlertDescription";

/**
 * Alert component for displaying feedback messages.
 * Uses the responsive layout variant system for consistent responsive behavior.
 * 
 * @example
 * <Alert variant="success">
 *   <Alert.Title>Success</Alert.Title>
 *   <Alert.Description>Your data has been saved successfully!</Alert.Description>
 * </Alert>
 * 
 * @example
 * <Alert variant="error" layout="stacked">
 *   <Alert.Title>Error</Alert.Title>
 *   <Alert.Description>There was a problem saving your data.</Alert.Description>
 * </Alert>
 */
const AlertRoot = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, intent, appearance, layout, children, ...props }, ref) => {
    const styles = alertVariants({ intent, appearance, layout });
    
    return (
      <AlertContext.Provider value={{ styles }}>
        <div
          ref={ref}
          role="alert"
          className={cn(styles.root(), className)}
          {...props}
        >
          {children}
        </div>
      </AlertContext.Provider>
    );
  }
);

AlertRoot.displayName = "Alert";

// Define the component interface with its subcomponents
export interface AlertComponent extends React.ForwardRefExoticComponent<AlertProps & React.RefAttributes<HTMLDivElement>> {
  Title: typeof AlertTitle;
  Description: typeof AlertDescription;
}

// Export the Alert component with its subcomponents attached
export const Alert = Object.assign(AlertRoot, {
  Title: AlertTitle,
  Description: AlertDescription,
}) as AlertComponent;

// Default export for backward compatibility
export default Alert;