import {
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  // DocumentChartBarIcon,
  // BookOpenIcon,
  TableCellsIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

import type {
  NavigationItem,
  TeamItem,
} from "@/components/composed/layouts/sidebar/NavigationSidebar";
import { PERMISSIONS } from "@core-types/auth";

// 313 Summer Program Navigation
export const navigationItems: NavigationItem[] = [
  {
    name: "313 Home",
    href: "/313",
    icon: HomeIcon,
    current: false,
  },
  {
    name: "Students",
    href: "/313/students",
    icon: UserGroupIcon,
    current: false,
    requiredPermissions: [PERMISSIONS.STUDENTS_VIEW],
  },
  {
    name: "Analytics",
    href: "/313/analytics",
    icon: ChartBarIcon,
    current: false,
    requiredPermissions: [PERMISSIONS.ANALYTICS_VIEW],
  },
  {
    name: "Zearn Import",
    href: "/313/zearn-import",
    icon: ArrowDownTrayIcon,
    current: false,
    requiredPermissions: [PERMISSIONS.STUDENTS_EDIT], // Requires ability to modify student data
  },
  {
    name: "Google Sheets Export",
    href: "/313/google-sheets-export",
    icon: TableCellsIcon,
    current: false,
    requiredPermissions: [PERMISSIONS.REPORTS_VIEW],
  },
];

// 313 Summer Program Teams (districts)
export const teamItems: TeamItem[] = [
  {
    id: "d9",
    name: "District 9",
    href: "/313?district=D9",
    initial: "9",
    current: false,
  },
  {
    id: "d11",
    name: "District 11",
    href: "/313?district=D11",
    initial: "11",
    current: false,
  },
];

// 313 Page metadata for dynamic titles/descriptions
export const pageMetadata: Record<
  string,
  { title: string; description: string }
> = {
  "/313": {
    title: "313 Summer Program",
    description: "Dashboard for 313 Summer Program management",
  },
  "/313/students": {
    title: "Students",
    description: "Manage and view all summer program students",
  },
  "/313/analytics": {
    title: "Analytics",
    description: "View summer program analytics and performance metrics",
  },
  "/313/zearn-import": {
    title: "Zearn Import",
    description: "Import Zearn completion data for students",
  },
  "/313/google-sheets-export": {
    title: "Google Sheets Export",
    description: "Export student data to Google Sheets",
  },
};
