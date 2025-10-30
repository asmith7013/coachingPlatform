"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function RoadmapsNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/roadmaps/units", label: "Units" },
    { href: "/roadmaps/skills", label: "Skills" },
    { href: "/roadmaps/scope-and-sequence", label: "Scope & Sequence" },
  ];

  return (
    <nav className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
