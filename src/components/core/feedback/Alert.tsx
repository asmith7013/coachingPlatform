// src/components/core/feedback/Alert.tsx
import React, { createContext, useContext } from 'react';
import { tv } from 'tailwind-variants';
import { cn } from '@ui/utils/formatters';

// Define alert variants using the token-first approach
const alertVariants = tv({
  slots: {
    root: "relative flex w-full rounded-lg border p-4",
    title: "mb-1 font-medium leading-none tracking-tight",
    description: "text-sm [&_p]:leading-relaxed",
  },
  variants: {
    variant: {
      default: { root: "bg-background text-foreground" },
      primary: { root: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300" },
      success: { root: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300" },
      warning: { root: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300" },
      error: { root: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300" },
      info: { root: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300" },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

// Create context to share styles between components
type AlertContextType = {
  styles: ReturnType<typeof alertVariants>;
};

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
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info";
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
 * 
 * @example
 * <Alert variant="success">
 *   <Alert.Title>Success</Alert.Title>
 *   <Alert.Description>Your data has been saved successfully!</Alert.Description>
 * </Alert>
 */
const AlertRoot = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, children, ...props }, ref) => {
    const styles = alertVariants({ variant });
    
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
interface AlertComponent extends React.ForwardRefExoticComponent<AlertProps & React.RefAttributes<HTMLDivElement>> {
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