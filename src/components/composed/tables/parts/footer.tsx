import { ReactNode } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const tableFooter = tv({
  slots: {
    root: "bg-surface border-surface",
    cell: "px-4 py-3 text-muted",
  },
  variants: {
    size: {
      sm: { cell: "text-xs" },
      md: { cell: "text-sm" },
      lg: { cell: "text-base" },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type TableFooterVariants = VariantProps<typeof tableFooter>;
export const tableFooterStyles = tableFooter;

interface TableFooterProps extends TableFooterVariants {
  children: ReactNode;
  className?: string;
}

export function TableFooter({ children, className, size }: TableFooterProps) {
  const styles = tableFooter({ size });

  return (
    <tfoot className={styles.root({ className })}>
      <tr>
        <td colSpan={100} className={styles.cell()}>
          {children}
        </td>
      </tr>
    </tfoot>
  );
}
