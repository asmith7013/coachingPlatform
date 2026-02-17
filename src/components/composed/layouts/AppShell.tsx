"use client";

import { useState, ReactNode } from "react";
import { tv } from "tailwind-variants";
import { cn } from "@ui/utils/formatters";
import { Topbar } from "./Topbar";
import {
  NavigationSidebar,
  type NavigationItem,
  type TeamItem,
} from "./sidebar/NavigationSidebar";
import {
  HomeIcon,
  UsersIcon,
  FolderIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";

// Default navigation items
const defaultNavigation: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon, current: true },
  { name: "Team", href: "/team", icon: UsersIcon, current: false },
  { name: "Projects", href: "/projects", icon: FolderIcon, current: false },
  { name: "Calendar", href: "/calendar", icon: CalendarIcon, current: false },
  {
    name: "Documents",
    href: "/documents",
    icon: DocumentDuplicateIcon,
    current: false,
  },
  { name: "Reports", href: "/reports", icon: ChartPieIcon, current: false },
];

// Default teams
const defaultTeams: TeamItem[] = [
  { id: 1, name: "Heroicons", href: "#", initial: "H", current: false },
  { id: 2, name: "Tailwind Labs", href: "#", initial: "T", current: false },
  { id: 3, name: "Workcation", href: "#", initial: "W", current: false },
];

interface IntegratedAppShellProps {
  children: ReactNode;
  navigation?: NavigationItem[];
  teams?: TeamItem[];
  showTeams?: boolean;
  pageTitle?: string;
  pageDescription?: string;
  breadcrumbs?: Array<{ name: string; href: string; current: boolean }>;
  className?: string;
}

// Create layout styles using tv from tailwind-variants
const appShell = tv({
  slots: {
    root: [
      "h-screen", // Full viewport height
      "grid",
      // Mobile: single column, rows for topbar and content
      "grid-rows-[auto_1fr]",
      "grid-cols-1",
      // Desktop: use flex layout to accommodate dynamic sidebar width
      "lg:flex lg:flex-row lg:grid-rows-none lg:grid-cols-none",
      "bg-background",
    ],
    // Mobile topbar - spans full width
    mobileTopbar: [
      "lg:hidden",
      "col-span-full",
      "sticky top-0 z-10",
      "bg-white border-b border-gray-200",
    ],
    // Desktop sidebar - no longer needs grid positioning
    // sidebar: [
    //   'hidden lg:block',
    //   'lg:flex-shrink-0', // Don't shrink the sidebar
    //   'lg:h-screen', // CHANGE: Explicitly set full screen height
    //   'overflow-hidden', // CHANGE: Remove overflow from container
    //   'border-r border-gray-200',
    //   'bg-white'
    // ],
    sidebar: [
      "hidden lg:block",
      "lg:fixed lg:left-0 lg:top-0", // Fixed positioning
      "lg:h-screen lg:w-64", // Full height, fixed width
      "overflow-hidden", // Sidebar container doesn't scroll
      "border-r border-gray-200",
      "bg-white",
      "z-30", // Above content
    ],
    // Content area container
    contentArea: [
      "col-span-full lg:flex-1 lg:ml-64", // Take remaining space on desktop
      "flex flex-col",
      "min-h-0",
      "h-full",
      "lg:min-w-0", // Prevent content area from expanding beyond available space
    ],

    // Desktop topbar - only spans content area (after sidebar)
    desktopTopbar: [
      "hidden lg:block",
      "sticky top-0 z-10",
      "bg-white border-b border-gray-200",
    ],
    // Main content - remove overflow from here, move to mainContent
    content: ["min-h-0", "flex-1", "bg-background"],
    mainContent: [
      "flex-1",
      "overflow-y-auto", // Primary scroll container
      "px-0", // Remove any conflicting padding
    ],
    contentWrapper: [
      "mx-auto max-w-7xl px-3 sm:px-4 lg:px-6",
      "py-4", // Keep padding but remove height constraints that compete with flex
    ],
  },
  variants: {
    padding: {
      none: {
        mainContent: "py-0",
        contentWrapper: "px-0",
      },
      sm: {
        mainContent: "py-2",
        contentWrapper: "px-2 sm:px-3 lg:px-4",
      },
      md: {
        mainContent: "py-4",
        contentWrapper: "px-3 sm:px-4 lg:px-6",
      },
      lg: {
        mainContent: "py-6",
        contentWrapper: "px-4 sm:px-6 lg:px-8",
      },
      xl: {
        mainContent: "py-8",
        contentWrapper: "px-6 sm:px-8 lg:px-10",
      },
    },
  },
  defaultVariants: {
    padding: "md",
  },
});

export function AppShell({
  children,
  navigation = defaultNavigation,
  teams = defaultTeams,
  showTeams = true,
  breadcrumbs = [],
  className,
}: IntegratedAppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const styles = appShell();

  return (
    <div className={cn(styles.root(), className)}>
      {/* Mobile-only topbar */}
      <div className={styles.mobileTopbar()}>
        <Topbar
          breadcrumbs={breadcrumbs}
          onMenuClick={() => setSidebarOpen(true)}
        />
      </div>

      {/* Desktop sidebar - spans full height including topbar area */}
      <div className={styles.sidebar()}>
        <NavigationSidebar
          navigation={navigation}
          teams={teams}
          showTeams={showTeams}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </div>

      {/* Content area - contains desktop topbar and main content */}
      <div className={styles.contentArea()}>
        {/* Desktop-only topbar - positioned after sidebar */}
        <div className={styles.desktopTopbar()}>
          <Topbar breadcrumbs={breadcrumbs} />
        </div>

        {/* Main content area */}
        <main className={styles.content()}>
          <div className={styles.mainContent()}>
            <div className={styles.contentWrapper()}>{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
