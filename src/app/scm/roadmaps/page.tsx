"use client";

import Link from "next/link";
import {
  ChevronRightIcon,
  MapIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  ChartBarIcon,
  TableCellsIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

export default function RoadmapsHomePage() {
  const pages = [
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
  ];

  return (
    <div className="mx-auto" style={{ maxWidth: "1600px" }}>
      <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <MapIcon className="w-10 h-10 text-emerald-600 flex-shrink-0" />
          <h1 className="text-4xl font-bold text-gray-900">Roadmaps</h1>
        </div>
        <p className="text-gray-600">
          Visualizing Roadmaps Skills & Student Skill Progress
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <ul role="list" className="divide-y divide-gray-100">
          {pages.map((page) => (
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
    </div>
  );
}
