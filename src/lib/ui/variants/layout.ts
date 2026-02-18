import { tv, type VariantProps } from "tailwind-variants";
import { layout } from "../../tokens";

export const gridVariants = tv({
  base: "grid",
  variants: {
    cols: layout.grid.cols,
    gap: layout.grid.gap,
  },
  defaultVariants: {
    cols: 1,
    gap: "md",
  },
});

export const flexVariants = tv({
  base: "flex",
  variants: {
    direction: {
      row: "flex-row",
      col: "flex-col",
      "row-reverse": "flex-row-reverse",
      "col-reverse": "flex-col-reverse",
    },
    justify: {
      start: "justify-start",
      end: "justify-end",
      center: "justify-center",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    },
    align: {
      start: "items-start",
      end: "items-end",
      center: "items-center",
      baseline: "items-baseline",
      stretch: "items-stretch",
    },
  },
  defaultVariants: {
    direction: "row",
    justify: "start",
    align: "start",
  },
});

export type GridVariants = VariantProps<typeof gridVariants>;
export type FlexVariants = VariantProps<typeof flexVariants>;

/**
 * Responsive layout variants for consistent responsive component layouts
 * Provides standardized responsive patterns that can be shared across components
 */
export const responsiveLayoutVariant = tv({
  slots: {
    // Container that changes layout based on screen size
    container: "",
    // Title element with appropriate spacing in different layouts
    title: "",
    // Content element with appropriate spacing in different layouts
    content: "",
  },
  variants: {
    // Layout direction variants
    stack: {
      // Always stacked (column) regardless of screen size
      always: {
        container: "flex flex-col gap-1",
        title: "mb-1",
        content: "",
      },
      // Responsive: stacked on mobile, row on tablet+
      responsive: {
        container:
          "flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3",
        title: "mb-1 sm:mb-0 sm:mr-2",
        content: "w-full sm:w-auto",
      },
      // Reverse responsive: row on mobile, stacked on desktop
      reverse: {
        container:
          "flex flex-row sm:flex-col items-center sm:items-start gap-2 sm:gap-1",
        title: "mr-2 sm:mr-0 sm:mb-1",
        content: "w-auto sm:w-full",
      },
    },
    // Alignment variants for the container
    align: {
      start: {
        container: "items-start",
      },
      center: {
        container: "items-center",
      },
      end: {
        container: "items-end",
      },
      stretch: {
        container: "items-stretch",
      },
    },
    // Spacing variants for title and content
    titleSpacing: {
      compact: {
        title: "mb-0.5 sm:mb-0 sm:mr-1",
      },
      normal: {
        title: "mb-1 sm:mb-0 sm:mr-2",
      },
      loose: {
        title: "mb-2 sm:mb-0 sm:mr-3",
      },
      responsive: {
        title: "mb-1 sm:mb-0 sm:mr-2", // Default responsive spacing
      },
    },
    // Width variants for the content area
    contentWidth: {
      auto: {
        content: "w-auto",
      },
      full: {
        content: "w-full",
      },
      responsive: {
        content: "w-full sm:w-auto",
      },
    },
  },
  defaultVariants: {
    stack: "responsive",
    align: "start",
    titleSpacing: "normal",
    contentWidth: "responsive",
  },
});

/**
 * Responsive grid layout variant for consistent grid layouts
 * Provides standard grid patterns that adapt to different screen sizes
 */
export const responsiveGridVariant = tv({
  base: "grid gap-4",
  variants: {
    columns: {
      // 1 column on mobile, 2 on tablet, 3 on desktop
      "1-2-3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      // 1 column on mobile, 2 on tablet, 4 on desktop
      "1-2-4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      // 1 column on mobile, 3 on tablet, 5 on desktop
      "1-3-5": "grid-cols-1 md:grid-cols-3 xl:grid-cols-5",
      // Automatically fit columns based on content
      auto: "grid-cols-1 sm:grid-auto-fit-md lg:grid-auto-fit-lg",
    },
    gap: {
      small: "gap-2",
      medium: "gap-4",
      large: "gap-6",
      responsive: "gap-2 sm:gap-4 lg:gap-6",
    },
  },
  defaultVariants: {
    columns: "1-2-3",
    gap: "medium",
  },
});

/**
 * Responsive spacing variant for consistent spacing across components
 * Provides standardized spacing that adapts to different screen sizes
 */
export const responsiveSpacingVariant = tv({
  variants: {
    margin: {
      responsive: "m-2 sm:m-3 lg:m-4",
      horizontal: "mx-2 sm:mx-3 lg:mx-4",
      vertical: "my-2 sm:my-3 lg:my-4",
      none: "m-0",
    },
    padding: {
      responsive: "p-2 sm:p-3 lg:p-4",
      horizontal: "px-2 sm:px-3 lg:px-4",
      vertical: "py-2 sm:py-3 lg:py-4",
      none: "p-0",
    },
    gap: {
      small: "gap-1 sm:gap-2",
      medium: "gap-2 sm:gap-3 lg:gap-4",
      large: "gap-3 sm:gap-4 lg:gap-6",
      none: "gap-0",
    },
  },
  defaultVariants: {
    margin: "none",
    padding: "none",
    gap: "none",
  },
});

/**
 * Icon and content layout variant for buttons, alerts, and other components
 * that combine icons with text content
 */
export const iconContentLayoutVariant = tv({
  slots: {
    container: "",
    icon: "",
    content: "",
  },
  variants: {
    position: {
      // Icon on the left
      left: {
        container: "flex flex-row items-center",
        icon: "mr-2",
        content: "",
      },
      // Icon on the right
      right: {
        container: "flex flex-row-reverse items-center",
        icon: "ml-2",
        content: "",
      },
      // Icon on top (stacked)
      top: {
        container: "flex flex-col items-center",
        icon: "mb-2",
        content: "",
      },
      // Icon on bottom (stacked)
      bottom: {
        container: "flex flex-col-reverse items-center",
        icon: "mt-2",
        content: "",
      },
      // Responsive: icon on top for mobile, left for desktop
      responsive: {
        container: "flex flex-col sm:flex-row items-center",
        icon: "mb-2 sm:mb-0 sm:mr-2",
        content: "",
      },
    },
    size: {
      small: {
        icon: "w-4 h-4",
      },
      medium: {
        icon: "w-5 h-5",
      },
      large: {
        icon: "w-6 h-6",
      },
    },
  },
  defaultVariants: {
    position: "left",
    size: "medium",
  },
});

/**
 * Container layout variant for card-like components with responsive padding and border radius
 * Provides standardized container styling for consistent component appearance
 */
export const containerLayoutVariant = tv({
  base: "relative w-full",
  variants: {
    padding: {
      none: "p-0",
      sm: "p-2 sm:p-3",
      md: "p-3 sm:p-4",
      lg: "p-4 sm:p-6",
      responsive: "p-2 sm:p-3 md:p-4 lg:p-6",
    },
    radius: {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full",
    },
    shadow: {
      none: "shadow-none",
      sm: "shadow-sm",
      md: "shadow",
      lg: "shadow-md",
      xl: "shadow-lg",
    },
    border: {
      none: "border-0",
      thin: "border border-gray-200 dark:border-gray-700",
      medium: "border-2 border-gray-200 dark:border-gray-700",
      thick: "border-4 border-gray-200 dark:border-gray-700",
    },
  },
  defaultVariants: {
    padding: "md",
    radius: "md",
    shadow: "none",
    border: "none",
  },
});

/**
 * Responsive form layout variant for consistent form layouts
 * Provides standard patterns for label and input alignment
 */
export const formLayoutVariant = tv({
  slots: {
    container: "w-full",
    labelContainer: "",
    label: "",
    inputContainer: "",
    helpText: "text-sm text-gray-500 dark:text-gray-400",
    errorText: "text-sm text-red-500 dark:text-red-400",
  },
  variants: {
    layout: {
      // Standard stacked layout (label above input)
      stacked: {
        container: "flex flex-col gap-1",
        labelContainer: "mb-1",
        inputContainer: "w-full",
      },
      // Side by side layout (label next to input)
      horizontal: {
        container: "flex flex-row items-start gap-3",
        labelContainer: "w-1/3 pt-2 text-right",
        inputContainer: "w-2/3",
      },
      // Responsive layout (stacked on mobile, horizontal on desktop)
      responsive: {
        container: "flex flex-col sm:flex-row items-start gap-2 sm:gap-3",
        labelContainer: "w-full sm:w-1/3 sm:pt-2 sm:text-right",
        inputContainer: "w-full sm:w-2/3",
      },
      // Compact inline layout for inline forms
      inline: {
        container: "flex flex-row items-center gap-2",
        labelContainer: "whitespace-nowrap",
        inputContainer: "flex-1",
      },
    },
    labelAlignment: {
      left: {
        labelContainer: "text-left",
      },
      right: {
        labelContainer: "text-right",
      },
      center: {
        labelContainer: "text-center",
      },
    },
  },
  defaultVariants: {
    layout: "stacked",
    labelAlignment: "left",
  },
});

// Add export types for the new variants
export type ResponsiveLayoutVariants = VariantProps<
  typeof responsiveLayoutVariant
>;
export type ResponsiveGridVariants = VariantProps<typeof responsiveGridVariant>;
export type ResponsiveSpacingVariants = VariantProps<
  typeof responsiveSpacingVariant
>;
export type IconContentLayoutVariants = VariantProps<
  typeof iconContentLayoutVariant
>;
export type ContainerLayoutVariants = VariantProps<
  typeof containerLayoutVariant
>;
export type FormLayoutVariants = VariantProps<typeof formLayoutVariant>;
