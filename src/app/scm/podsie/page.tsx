"use client";

import Link from "next/link";
import {
  ChevronRightIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export default function PodsieHomePage() {
  const pages = [
    {
      title: "Progress",
      href: "/scm/podsie/progress",
      Icon: ArrowTrendingUpIcon,
      description: "Track student progress on Podsie lessons and assessments.",
    },
    {
      title: "Velocity",
      href: "/scm/podsie/velocity",
      Icon: ChartBarIcon,
      description: "Track class velocity and completion rates over time.",
    },
  ];

  return (
    <div className="mx-auto" style={{ maxWidth: "1600px" }}>
      <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-emerald-500 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">P</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Podsie</h1>
        </div>
        <p className="text-gray-600">
          Track student progress on Podsie lessons and assessments
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <ul role="list" className="divide-y divide-gray-100">
          {pages.map((page) => (
            <li
              key={page.href}
              className="relative flex justify-between hover:bg-gray-50 transition-colors"
            >
              <Link
                href={page.href}
                className="flex flex-1 items-center gap-x-4 px-6 py-4"
              >
                {page.Icon && (
                  <page.Icon className="w-6 h-6 text-gray-600 flex-shrink-0" />
                )}
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold text-gray-900">
                    {page.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {page.description}
                  </p>
                </div>
                <ChevronRightIcon
                  aria-hidden="true"
                  className="size-5 flex-none text-gray-400"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
