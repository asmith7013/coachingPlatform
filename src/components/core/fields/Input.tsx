import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@ui/utils/formatters";
import {
  textSize,
  paddingX,
  paddingY,
  radii,
  borderWidths,
} from "@ui-tokens/tokens";

import {
  backgroundColors,
  borderColors,
  ringColors,
  textColors,
} from "@/lib/tokens/colors";
import { FieldWrapper } from "./FieldWrapper";
import type { FieldComponentProps } from "@/lib/types/core/token";
import type { AnyFieldApi } from "@tanstack/react-form";

const input = tv({
  slots: {
    base: `w-full ${borderWidths.sm} ${backgroundColors.white} ${textColors.default} placeholder:${textColors.muted} focus:outline-none focus:ring-2 ${ringColors.primary} focus:border-transparent`,
    wrapper: "",
  },
  variants: {
    textSize: {
      xs: textSize.xs,
      sm: textSize.sm,
      base: textSize.base,
      lg: textSize.lg,
      xl: textSize.xl,
      "2xl": textSize["2xl"],
    },
    padding: {
      none: `${paddingX.none} ${paddingY.none}`,
      xs: `${paddingX.xs} ${paddingY.xs}`,
      sm: `${paddingX.sm} ${paddingY.xs}`,
      md: `${paddingX.md} ${paddingY.sm}`,
      lg: `${paddingX.lg} ${paddingY.md}`,
      xl: `${paddingX.xl} ${paddingY.lg}`,
      "2xl": `${paddingX["2xl"]} ${paddingY["2xl"]}`,
    },
    radius: {
      none: radii.none,
      sm: radii.sm,
      md: radii.md,
      lg: radii.lg,
      xl: radii.xl,
      "2xl": radii["2xl"],
      full: radii.full,
    },
    disabled: {
      true: "opacity-60 pointer-events-none",
      false: "",
    },
    error: {
      true: `${borderColors.danger} focus:${ringColors.danger}`,
      false: `${borderColors.default}`,
    },
  },
  defaultVariants: {
    textSize: "base",
    padding: "md",
    radius: "md",
    disabled: false,
    error: false,
  },
});

export type InputVariants = VariantProps<typeof input>;
type InputHTMLProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">;

export interface InputProps
  extends InputHTMLProps,
    Omit<FieldComponentProps, "children"> {
  disabled?: boolean;
  /** TanStack Form field API for advanced integration */
  fieldApi?: AnyFieldApi;
  /** @deprecated Use helpText instead */
  helperText?: string;
}

export function Input({
  label,
  error,
  helpText,
  helperText: _helperText,
  className,
  textSize,
  padding,
  radius,
  disabled,
  required,
  readOnly,
  fieldApi,
  ...props
}: InputProps) {
  // TanStack Form integration: override props when fieldApi is provided
  const finalValue = fieldApi ? fieldApi.state.value : props.value;
  const finalError = fieldApi ? fieldApi.state.meta.errors?.[0] : error;
  const finalDisabled =
    disabled || (fieldApi ? fieldApi.state.meta.isValidating : false);

  // TanStack Form event handlers
  const handleChange = fieldApi
    ? (e: React.ChangeEvent<HTMLInputElement>) =>
        fieldApi.handleChange(e.target.value)
    : props.onChange;

  const handleBlur = fieldApi ? () => fieldApi.handleBlur() : props.onBlur;

  const { base } = input({
    textSize,
    padding,
    radius,
    error: Boolean(finalError),
    disabled: finalDisabled,
  });

  return (
    <FieldWrapper
      id={props.id || fieldApi?.name}
      label={label}
      error={typeof finalError === "boolean" ? undefined : finalError}
      helpText={helpText}
      textSize={textSize}
      padding={padding}
      required={required}
    >
      <input
        {...props}
        value={finalValue as string}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={finalDisabled}
        readOnly={readOnly}
        className={cn(base(), className)}
      />
    </FieldWrapper>
  );
}

export default Input;
