"use client";

import Link from "next/link";
import {
  ChevronRightIcon,
  MapIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  GiftIcon,
  DocumentPlusIcon,
  TableCellsIcon,
  ArrowTrendingUpIcon,
  PresentationChartBarIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { useAuthenticatedUser } from "@/hooks/auth/useAuthenticatedUser";

export default function SCMHomePage() {
  const { hasRole } = useAuthenticatedUser();
  const isSuperAdmin = hasRole('super_admin');
  const isCoach = hasRole('coach');

  const categories = [
    {
      title: "Roadmaps",
      Icon: MapIcon,
      iconType: "heroicon" as const,
      description: "Visualizing Roadmaps Skills & Student Skill Progress",
      pages: [
        {
          title: "Lesson by Lesson",
          href: "/scm/roadmaps/scope-and-sequence",
          Icon: CalendarDaysIcon,
          description: "See how skills progress across lessons in each unit."
        },
        {
          title: "Units",
          href: "/scm/roadmaps/units",
          Icon: BookOpenIcon,
          description: "View units by grade level with their target and support skills."
        },
        {
          title: "Skills",
          href: "/scm/roadmaps/skills",
          Icon: ChartBarIcon,
          description: "Browse individual skills with teaching resources and prerequisites."
        },
        {
          title: "Mastery Grid",
          href: "/scm/roadmaps/mastery-grid",
          Icon: TableCellsIcon,
          description: "View student mastery progress by unit and section."
        },
        {
          title: "History",
          href: "/scm/roadmaps/history",
          Icon: ClockIcon,
          description: "View all student assessment attempts and progress over time."
        },
        {
          title: "Progress",
          href: "/scm/roadmaps/progress",
          Icon: ArrowTrendingUpIcon,
          description: "View roadmap completion progress by section with bar charts."
        }
      ]
    },
    {
      title: "Podsie",
      iconLetter: "P",
      iconType: "letter" as const,
      description: "Track student progress on Podsie lessons and assessments",
      pages: [
        {
          title: "Pace",
          href: "/scm/podsie/pace",
          Icon: ChartBarIcon,
          description: "View pacing progress across multiple sections at once."
        },
        {
          title: "Progress",
          href: "/scm/podsie/progress",
          Icon: ArrowTrendingUpIcon,
          description: "Track student progress on Podsie lessons and assessments."
        },
        {
          title: "Velocity",
          href: "/scm/podsie/velocity",
          Icon: ChartBarIcon,
          description: "Track class velocity and completion rates over time."
        }
      ]
    },
    {
      title: "Incentives",
      Icon: GiftIcon,
      iconType: "heroicon" as const,
      description: "Track and manage student incentive activities",
      pages: [
        {
          title: "Form",
          href: "/scm/incentives/form",
          Icon: DocumentPlusIcon,
          description: "Log new student activities and achievements."
        },
        {
          title: "Summary",
          href: "/scm/incentives/data",
          Icon: ChartBarIcon,
          description: "View tracking summaries and analytics."
        },
        {
          title: "Table",
          href: "/scm/incentives/table",
          Icon: DocumentTextIcon,
          description: "View and edit all activity records."
        }
      ]
    },
    {
      title: "Worked Examples",
      Icon: PresentationChartBarIcon,
      iconType: "heroicon" as const,
      description: "Browse and view worked example slide decks",
      pages: [
        {
          title: "All Worked Examples",
          href: "/scm/workedExamples",
          Icon: PresentationChartBarIcon,
          description: "View all scaffolded guidance slide decks."
        }
      ]
    },
    // Logistics - only shown for coaches
    ...((isCoach || isSuperAdmin) ? [{
      title: "Logistics",
      Icon: TruckIcon,
      iconType: "heroicon" as const,
      description: "School calendars, scheduling, and operational tools",
      pages: [
        {
          title: "Unit Calendar",
          href: "/scm/logistics/calendar",
          Icon: CalendarDaysIcon,
          description: "Manage unit schedules and pacing for each class section."
        }
      ]
    }] : []),
  ];

  return (
    <div className="mx-auto" style={{ maxWidth: "1600px" }}>
      <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Studio Classroom Math</h1>
        <p className="text-gray-600">
          Comprehensive platform for curriculum management, student progress tracking, and incentive programs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map((category) => (
          <div key={category.title} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {category.iconType === "letter" ? (
                  <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{category.iconLetter}</span>
                  </div>
                ) : category.iconType === "heroicon" && category.Icon ? (
                  <category.Icon className="w-10 h-10 text-emerald-600 flex-shrink-0" />
                ) : null}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
                  <p className="text-sm text-gray-600 mt-0.5">{category.description}</p>
                </div>
              </div>
            </div>

            <ul role="list" className="divide-y divide-gray-100">
              {category.pages.map((page) => (
                <li key={page.href} className="relative flex justify-between hover:bg-gray-50 transition-colors">
                  <Link href={page.href} className="flex flex-1 items-center gap-x-4 px-6 py-4">
                    {page.Icon && <page.Icon className="w-6 h-6 text-gray-600 flex-shrink-0" />}
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold text-gray-900">
                        {page.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {page.description}
                      </p>
                    </div>
                    <ChevronRightIcon aria-hidden="true" className="size-5 flex-none text-gray-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
