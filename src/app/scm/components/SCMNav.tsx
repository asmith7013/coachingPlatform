"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  MapIcon,
  GiftIcon
} from '@heroicons/react/24/outline';

type NavCategory = {
  label: string;
  items: { href: string; label: string }[];
  Icon?: React.ComponentType<{ className?: string }>;
  iconLetter?: string;
};

export function SCMNav() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories: NavCategory[] = [
    {
      label: "Roadmaps",
      Icon: MapIcon,
      items: [
        { href: "/scm/roadmaps/scope-and-sequence", label: "Lesson by Lesson" },
        { href: "/scm/roadmaps/units", label: "Units" },
        { href: "/scm/roadmaps/skills", label: "Skills" },
        { href: "/scm/roadmaps/mastery-grid", label: "Mastery Grid" },
        { href: "/scm/roadmaps/history", label: "History" },
      ],
    },
    {
      label: "Podsie",
      iconLetter: "P",
      items: [
        { href: "/scm/podsie/progress", label: "Progress" },
      ],
    },
    {
      label: "Incentives",
      Icon: GiftIcon,
      items: [
        { href: "/scm/incentives/form", label: "Form" },
        { href: "/scm/incentives/data", label: "Summary" },
        { href: "/scm/incentives/table", label: "Table" },
      ],
    },
  ];

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const isActiveCategory = (category: NavCategory) => {
    return category.items.some((item) => pathname.startsWith(item.href));
  };

  return (
    <nav className="bg-white rounded-lg shadow-sm p-4 mb-6" ref={dropdownRef}>
      <div className="flex justify-between items-center gap-2">
        <div className="flex gap-2 relative">
          {categories.map((category) => {
            const isActive = isActiveCategory(category);
            const isOpen = openDropdown === category.label;

            return (
              <div key={category.label} className="relative">
                <button
                  onClick={() => toggleDropdown(category.label)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.iconLetter ? (
                    <div className="w-5 h-5 flex-shrink-0 rounded flex items-center justify-center text-sm font-bold">
                      {category.iconLetter}
                    </div>
                  ) : category.Icon ? (
                    <category.Icon className="w-5 h-5 flex-shrink-0" />
                  ) : null}
                  {category.label}
                  <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[200px] z-50">
                    {category.items.map((item) => {
                      const isItemActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpenDropdown(null)}
                          className={`block px-4 py-2 text-sm transition-colors ${
                            isItemActive
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <Link
          href="/sign-out"
          className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          Sign Out
        </Link>
      </div>
    </nav>
  );
}
