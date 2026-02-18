"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { tv, type VariantProps } from "tailwind-variants";

const viewSelector = tv({
  slots: {
    menuButton:
      "flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50",
    menuItems:
      "absolute right-0 z-10 mt-3 w-36 origin-top-right overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden data-closed:scale-95 data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in",
    menuItemsInner: "py-1",
    menuItem:
      "block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden",
    chevron: "-mr-1 size-5 text-gray-400",
  },
  variants: {
    variant: {
      default: {},
      compact: {
        menuButton: "px-2 py-1.5 text-xs",
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ViewSelectorProps extends VariantProps<typeof viewSelector> {
  currentView?: "day" | "week" | "month" | "year";
  onViewChange?: (view: "day" | "week" | "month" | "year") => void;
}

export function ViewSelector({
  currentView = "week",
  onViewChange,
  variant,
}: ViewSelectorProps) {
  const styles = viewSelector({ variant });

  const viewLabels = {
    day: "Day view",
    week: "Week view",
    month: "Month view",
    year: "Year view",
  };

  return (
    <Menu as="div" className="relative">
      <MenuButton className={styles.menuButton()}>
        {viewLabels[currentView]}
        <ChevronDownIcon className={styles.chevron()} aria-hidden="true" />
      </MenuButton>

      <MenuItems className={styles.menuItems()}>
        <div className={styles.menuItemsInner()}>
          {Object.entries(viewLabels).map(([view, label]) => (
            <MenuItem key={view}>
              <button
                onClick={() =>
                  onViewChange?.(view as "day" | "week" | "month" | "year")
                }
                className={styles.menuItem()}
              >
                {label}
              </button>
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
}
