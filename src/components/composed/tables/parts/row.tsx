"use client";

import { tv, type VariantProps } from "tailwind-variants";
import { TableColumnSchema } from "@ui/table-schema";

const tableRow = tv({
  slots: {
    root: "hover:bg-surface-hover",
    cell: "text-text",
    actionCell: "text-right",
    actionButton: "text-primary hover:text-primary-hover",
  },
  variants: {
    clickable: {
      true: { root: "cursor-pointer" },
    },
    textSize: {
      sm: { cell: "text-xs" },
      base: { cell: "text-sm" },
      lg: { cell: "text-base" },
    },
    padding: {
      sm: {
        cell: "px-3 py-2",
        actionCell: "px-3 py-2",
      },
      md: {
        cell: "px-4 py-3",
        actionCell: "px-4 py-3",
      },
      lg: {
        cell: "px-6 py-4",
        actionCell: "px-6 py-4",
      },
    },
  },
  defaultVariants: {
    clickable: false,
    textSize: "base",
    padding: "md",
  },
});

export type TableRowVariants = VariantProps<typeof tableRow>;

export interface TableRowProps<T> {
  item: T;
  columns: TableColumnSchema<T>[];
  onClick?: () => void;
  textSize?: TableRowVariants["textSize"];
  padding?: TableRowVariants["padding"];
}

export function TableRow<T>({
  item,
  columns,
  onClick,
  textSize = "base",
  padding = "md",
}: TableRowProps<T>) {
  const styles = tableRow({
    clickable: !!onClick,
    textSize,
    padding,
  });

  return (
    <tr className={styles.root()} onClick={onClick}>
      {columns.map((column, index) => (
        <td key={index} className={styles.cell()}>
          {column.accessor(item)}
        </td>
      ))}
    </tr>
  );
}
