import { ElementType, ReactNode } from "react";
import { cn } from "@ui/utils/formatters";
import { tv, type VariantProps } from "tailwind-variants";
import { heading as headingLevels, textColors } from "@/lib/tokens/tokens";
import { HeadingLevelToken, TextColorToken } from "@/lib/tokens/types";

const heading = tv({
  slots: {
    heading: "font-heading tracking-tight",
    subheading: "font-body text-sm mt-1",
  },
  variants: {
    level: {
      h1: { heading: headingLevels.h1 },
      h2: { heading: headingLevels.h2 },
      h3: { heading: headingLevels.h3 },
      h4: { heading: headingLevels.h4 },
      h5: { heading: headingLevels.h5 },
      h6: { heading: headingLevels.h6 },
    },
    color: {
      default: { heading: textColors.default, subheading: textColors.muted },
      muted: { heading: textColors.muted, subheading: textColors.muted },
      accent: { heading: textColors.accent, subheading: textColors.muted },
      primary: { heading: textColors.primary, subheading: textColors.muted },
      secondary: {
        heading: textColors.secondary,
        subheading: textColors.muted,
      },
      danger: { heading: textColors.danger, subheading: textColors.muted },
      success: { heading: textColors.success, subheading: textColors.muted },
      surface: { heading: textColors.surface, subheading: textColors.muted },
      background: {
        heading: textColors.background,
        subheading: textColors.muted,
      },
      border: { heading: textColors.border, subheading: textColors.muted },
      white: { heading: textColors.white, subheading: textColors.white },
      black: { heading: textColors.black, subheading: textColors.muted },
    },
  },
  defaultVariants: {
    level: "h3",
    color: "default",
  },
});

export type HeadingVariants = VariantProps<typeof heading>;

export interface HeadingProps
  extends Omit<React.HTMLAttributes<HTMLHeadingElement>, "color"> {
  children: ReactNode;
  level?: HeadingLevelToken;
  color?: TextColorToken;
  subheading?: ReactNode;
  className?: string;
  subheadingClassName?: string;
}

const headingElements: Record<HeadingLevelToken, ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
};

export function Heading({
  children,
  level = "h3",
  color = "default",
  subheading,
  className,
  subheadingClassName,
  ...props
}: HeadingProps) {
  const Component = headingElements[level];
  const styles = heading({ level, color });

  return (
    <div>
      <Component className={cn(styles.heading(), className)} {...props}>
        {children}
      </Component>
      {subheading && (
        <p className={cn(styles.subheading(), subheadingClassName)}>
          {subheading}
        </p>
      )}
    </div>
  );
}
