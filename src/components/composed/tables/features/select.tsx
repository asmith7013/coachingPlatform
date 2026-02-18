import { tv, type VariantProps } from "tailwind-variants";
import { textColors } from "@/lib/tokens/tokens";

interface SelectOption {
  label: string;
  value: string;
}

const tableSelect = tv({
  base: [
    "rounded-md border",
    "bg-background border-surface",
    textColors.default,
    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
  ],
  variants: {
    textSize: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    },
    padding: {
      none: "p-0",
      xs: "px-2 py-1",
      sm: "px-3 py-1.5",
      md: "px-4 py-2",
      lg: "px-5 py-2.5",
      xl: "px-6 py-3",
    },
  },
  defaultVariants: {
    textSize: "base",
    padding: "md",
  },
});

export type TableSelectVariants = VariantProps<typeof tableSelect>;
export const tableSelectStyles = tableSelect;

interface TableSelectProps extends Omit<TableSelectVariants, "textSize"> {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  textSize?: TableSelectVariants["textSize"];
}

export function TableSelect({
  value,
  onChange,
  options,
  className,
  textSize = "base",
  padding = "md",
}: TableSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={tableSelect({ textSize, padding, className })}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
