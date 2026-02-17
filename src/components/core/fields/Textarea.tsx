import { cn } from "@ui/utils/formatters";
import { tv, type VariantProps } from "tailwind-variants";
import { radiusVariant, disabledVariant } from "@ui-variants/shared-variants";
import { textColors } from "@/lib/tokens/tokens";
import { TextSizeToken, PaddingToken, RadiusToken } from "@/lib/tokens/types";
import { FieldWrapper } from "./FieldWrapper";
import type { AnyFieldApi } from "@tanstack/react-form";

type TextareaHTMLProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "size"
>;

// 🎨 Textarea style variants
const textarea = tv({
  base: [
    "block w-full",
    "bg-surface",
    textColors.default,
    "placeholder:text-muted",
    "border border-surface-hover",
    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
    "transition-all",
  ],
  variants: {
    textSize: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
    },
    padding: {
      none: "p-0",
      xs: "px-2 py-1",
      sm: "px-3 py-1.5",
      md: "px-4 py-2",
      lg: "px-5 py-2.5",
      xl: "px-6 py-3",
      "2xl": "px-8 py-4",
    },
    radius: radiusVariant.variants.radius,
    disabled: disabledVariant.variants.disabled,
    error: {
      true: ["border-danger", "focus:ring-danger"],
    },
    width: {
      auto: "w-auto",
      full: "w-full",
    },
    resize: {
      none: "resize-none",
      vertical: "resize-y",
      horizontal: "resize-x",
      both: "resize",
    },
  },
  defaultVariants: {
    textSize: "base",
    padding: "md",
    radius: "md",
    width: "full",
    resize: "vertical",
  },
});

// ✅ Export for atomic style use elsewhere
export const textareaStyles = textarea;

// ✅ Export type for variant props
export type TextareaVariants = VariantProps<typeof textarea>;

export interface TextareaProps extends TextareaHTMLProps {
  label?: string;
  error?: string;
  textSize?: TextSizeToken;
  padding?: PaddingToken;
  radius?: RadiusToken;
  width?: "auto" | "full";
  resize?: "none" | "vertical" | "horizontal" | "both";
  disabled?: boolean;
  className?: string;
  rows?: number;
  /** TanStack Form field API for advanced integration */
  fieldApi?: AnyFieldApi;
}

export function Textarea({
  label,
  error,
  textSize,
  padding,
  radius,
  width,
  resize,
  className,
  disabled,
  rows = 4, // Set default to 4 rows
  fieldApi,
  ...props
}: TextareaProps) {
  // TanStack Form integration
  const finalValue = fieldApi ? fieldApi.state.value : props.value;
  const finalError = fieldApi ? fieldApi.state.meta.errors?.[0] : error;
  const finalDisabled =
    disabled || (fieldApi ? fieldApi.state.meta.isValidating : false);

  const handleChange = fieldApi
    ? (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        fieldApi.handleChange(e.target.value)
    : props.onChange;

  const handleBlur = fieldApi ? () => fieldApi.handleBlur() : props.onBlur;

  return (
    <FieldWrapper
      id={props.id || fieldApi?.name}
      label={label}
      error={finalError}
      textSize={textSize}
      padding={padding}
    >
      <textarea
        className={cn(
          textarea({
            textSize,
            padding,
            radius: radius as TextareaVariants["radius"],
            width,
            resize,
            error: Boolean(finalError),
            disabled: finalDisabled,
          }),
          className,
        )}
        {...props}
        value={finalValue as string}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={finalDisabled}
        rows={rows}
      />
    </FieldWrapper>
  );
}
