import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { cn } from "@ui/utils/formatters";
import {
  textSize,
  weight,
  paddingX,
  iconSizes,
  flex,
  spaceBetween,
  center,
} from "@/lib/tokens/tokens";
import { textColors, hoverTextColors } from "@/lib/tokens/colors";

interface BreadcrumbItem {
  name: string;
  href: string;
  current: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn("flex", className)} aria-label="Breadcrumb">
      <ol
        role="list"
        className={cn(
          center.x, // mx-auto → center.x
          "flex w-full max-w-screen-xl",
          spaceBetween.x.md, // space-x-4 → spaceBetween.x.md
          paddingX.md, // px-4 → paddingX.md
          "sm:px-6 lg:px-8", // Keep responsive as-is
        )}
      >
        <li className="flex">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className={cn(
                textColors.muted, // text-gray-400 → textColors.muted
                hoverTextColors.default, // hover:text-gray-500 → hoverTextColors.default
              )}
            >
              <HomeIcon
                className={cn(iconSizes.md, flex.shrink)}
                aria-hidden="true"
              />
              <span className="sr-only">Home</span>
            </Link>
          </div>
        </li>
        {items.map((item) => (
          <li key={item.href} className="flex">
            <div className="flex items-center">
              <ChevronRightIcon
                className={cn(
                  iconSizes.md, // h-5 w-5 → iconSizes.md
                  flex.shrink, // flex-shrink-0 → flex.shrink
                  textColors.muted, // text-gray-400 → textColors.muted
                )}
                aria-hidden="true"
              />
              <Link
                href={item.href}
                className={cn(
                  "ml-4", // Keep margin as-is
                  textSize.sm, // text-sm → textSize.sm
                  weight.medium, // font-medium → weight.medium
                  item.current
                    ? textColors.muted // text-gray-500 → textColors.muted
                    : cn(textColors.muted, hoverTextColors.default), // text-gray-500 hover:text-gray-700 → textColors.muted + hoverTextColors.default
                )}
                aria-current={item.current ? "page" : undefined}
              >
                {item.name}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
