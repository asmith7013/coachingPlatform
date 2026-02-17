// Test page to verify sidebar scrolling works
"use client";

import { AppShell } from "@/components/composed/layouts/AppShell";
import {
  HomeIcon,
  UsersIcon,
  FolderIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";

// Create test navigation with many items to force overflow
const testNavigation = [
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
  // Add many extra items to force overflow
  ...Array.from({ length: 20 }, (_, i) => ({
    name: `Test Item ${i + 1}`,
    href: `/test-${i}`,
    icon: HomeIcon,
    current: false,
  })),
];

const testTeams = [
  { id: 1, name: "Design", href: "#", initial: "D", current: false },
  { id: 2, name: "Engineering", href: "#", initial: "E", current: false },
  { id: 3, name: "Marketing", href: "#", initial: "M", current: false },
  // Add more teams
  ...Array.from({ length: 10 }, (_, i) => ({
    id: i + 4,
    name: `Team ${i + 4}`,
    href: "#",
    initial: `T${i + 4}`,
    current: false,
  })),
];

export default function SidebarScrollTestPage() {
  return (
    <AppShell navigation={testNavigation} teams={testTeams} showTeams={true}>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Sidebar Scroll Test
                </h1>
                <p className="mt-2 text-gray-600">
                  The sidebar should now scroll properly with many navigation
                  items.
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Check the sidebar on the left - it should have 26+ navigation
                  items and scroll smoothly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
