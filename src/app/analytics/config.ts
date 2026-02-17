import {
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CalculatorIcon,
  //   HomeIcon
} from "@heroicons/react/24/outline";
import type {
  NavigationItem,
  TeamItem,
} from "@composed-components/layouts/sidebar/NavigationSidebar";

export const analyticsNavigation: NavigationItem[] = [
  {
    name: "Overview",
    href: "/analytics",
    icon: ChartBarIcon,
  },
  {
    name: "Attendance",
    href: "/analytics/attendance",
    icon: UserGroupIcon,
    requiredPermissions: ["analytics.attendance.view"],
  },
  {
    name: "Mastery Checks",
    href: "/analytics/snorkl",
    icon: AcademicCapIcon,
    requiredPermissions: ["analytics.snorkl.view"],
  },
  {
    name: "Zearn",
    href: "/analytics/zearn",
    icon: CalculatorIcon,
    requiredPermissions: ["analytics.zearn.view"],
  },
  //   {
  //     name: 'Back to Dashboard',
  //     href: '/dashboard',
  //     icon: HomeIcon
  //   }
];

export const analyticsTeams: TeamItem[] = [];
