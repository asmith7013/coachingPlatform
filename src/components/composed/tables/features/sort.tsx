import { tv, type VariantProps } from "tailwind-variants";
import { textColors } from "@/lib/tokens/tokens";

const tableSort = tv({
  slots: {
    root: "flex items-center space-x-1 font-medium",
    icon: "ml-1",
  },
  variants: {
    textSize: {
      xs: { root: "text-xs" },
      sm: { root: "text-sm" },
      base: { root: "text-base" },
      lg: { root: "text-lg" },
      xl: { root: "text-xl" },
    },
    active: {
      true: { root: textColors.accent },
      false: { root: textColors.muted + " hover:" + textColors.accent },
    },
  },
  defaultVariants: {
    textSize: "base",
    active: false,
  },
});

export type TableSortVariants = VariantProps<typeof tableSort>;
export const tableSortStyles = tableSort;

interface TableSortProps extends Omit<TableSortVariants, "textSize"> {
  column: string;
  currentSort?: string;
  sortDirection?: "asc" | "desc";
  onSort: (column: string) => void;
  className?: string;
  textSize?: TableSortVariants["textSize"];
}

export function TableSort({
  column,
  currentSort,
  sortDirection,
  onSort,
  className,
  textSize = "base",
}: TableSortProps) {
  const isActive = currentSort === column;
  const styles = tableSort({ textSize, active: isActive });

  return (
    <button
      onClick={() => onSort(column)}
      className={styles.root({ className })}
    >
      <span>{column}</span>
      <span className={styles.icon()}>
        {isActive ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </button>
  );
}
