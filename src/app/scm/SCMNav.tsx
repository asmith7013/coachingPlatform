"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import {
  MapIcon,
  GiftIcon,
  PresentationChartBarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useAuthenticatedUser } from "@/hooks/auth/useAuthenticatedUser";

type NavItem = { href: string; label: string; description?: string };
type NavSection = { section: string; items: NavItem[] };

type NavCategory = {
  label: string;
  items: NavItem[];
  sections?: NavSection[];
  Icon?: React.ComponentType<{ className?: string }>;
  iconLetter?: string;
};

export function SCMNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { hasRole } = useAuthenticatedUser();

  const isSuperAdmin = hasRole('super_admin');
  const _isCoach = hasRole('coach');

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

  // Handle scroll to show/hide navigation
  useEffect(() => {
    function handleScroll() {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const categories: NavCategory[] = [
    {
      label: "Podsie",
      iconLetter: "P",
      items: [
        { href: "/scm/podsie/pace", label: "Pace" },
        { href: "/scm/podsie/progress", label: "Progress" },
        { href: "/scm/podsie/assessment", label: "Assessment" },
        { href: "/scm/podsie/velocity", label: "Velocity" },
        { href: "/scm/roadmaps/history", label: "History" },
      ],
    },
    {
      label: "Content",
      Icon: DocumentTextIcon,
      items: [
        { href: "/scm/content/lessons", label: "Scope & Sequence" },
        { href: "/scm/content/state-exam", label: "State Exam Questions" },
        { href: "/scm/content/calendar", label: "Unit Calendar" },
      ],
    },
    {
      label: "Worked Examples",
      Icon: PresentationChartBarIcon,
      items: [
        { href: "/scm/workedExamples/viewer?grade=6", label: "Grade 6" },
        { href: "/scm/workedExamples/viewer?grade=7", label: "Grade 7" },
        { href: "/scm/workedExamples/viewer?grade=8", label: "Grade 8" },
        { href: "/scm/workedExamples/viewer?grade=alg1", label: "Algebra 1" },
        { href: "---", label: "---" },
        { href: "/scm/workedExamples/create", label: "+ Create New" },
      ],
    },
    {
      label: "Roadmaps",
      Icon: MapIcon,
      items: [
        { href: "/scm/content/lessons", label: "Scope & Sequence" },
        { href: "/scm/roadmaps/units", label: "Units" },
        { href: "/scm/roadmaps/skills", label: "Skills" },
        { href: "/scm/roadmaps/mastery-grid", label: "Mastery Grid" },
        { href: "/scm/roadmaps/progress", label: "Progress" },
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
    ...(isSuperAdmin ? [{
      label: "Admin",
      Icon: Cog6ToothIcon,
      items: [] as NavItem[],
      sections: [
        {
          section: "Podsie Bulk",
          items: [
            { href: "/scm/podsie/import-attendance", label: "Import Attendance", description: "Import attendance data from Podsie" },
            { href: "/scm/podsie/bulk-sync", label: "Bulk Sync", description: "Sync Podsie mastery data" },
            { href: "/scm/podsie/bulk-configs", label: "Bulk Configs", description: "Add Podsie assignments to section configs" },
          ],
        },
        {
          section: "Podsie",
          items: [
            { href: "/scm/podsie/manage-configs", label: "Manage Configs", description: "Add section configs for a Podsie assignment" },
            { href: "/scm/podsie/question-mapper", label: "Question Mapper", description: "Update question maps" },
          ],
        },
        {
          section: "Content",
          items: [
            { href: "/scm/content/calendar", label: "Unit Calendar", description: "Set unit schedule for each scope and sequence" },
            { href: "/scm/content/edit-scope-and-sequence", label: "Edit Scope & Sequence", description: "Manage curriculum scope and sequence entries" },
          ],
        },
      ],
    }] : []),
  ];

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const toggleMobileCategory = (label: string) => {
    setMobileExpandedCategory(mobileExpandedCategory === label ? null : label);
  };

  const isActiveCategory = (category: NavCategory) => {
    const itemsActive = category.items.some((item) => pathname.startsWith(item.href));
    const sectionsActive = category.sections?.some((section) =>
      section.items.some((item) => pathname.startsWith(item.href))
    );
    return itemsActive || sectionsActive;
  };

  const isItemActive = (item: NavItem) => {
    if (item.href === "---") return false;
    const hasQueryParam = item.href.includes('?');
    const basePath = item.href.split('?')[0];
    if (hasQueryParam) {
      const itemParams = new URLSearchParams(item.href.split('?')[1]);
      const paramsMatch = Array.from(itemParams.entries()).every(
        ([key, value]) => searchParams.get(key) === value
      );
      return pathname === basePath && paramsMatch;
    }
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  return (
    <Disclosure
      as="nav"
      className={`bg-gray-900 shadow-lg sticky top-0 z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
      ref={dropdownRef}
    >
      <div className="mx-auto px-4 lg:px-6 py-3" style={{ maxWidth: "1600px" }}>
        <div className="flex justify-between items-center gap-2">
          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer">
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="block h-6 w-6 group-data-[open]:hidden" aria-hidden="true" />
              <XMarkIcon className="hidden h-6 w-6 group-data-[open]:block" aria-hidden="true" />
            </DisclosureButton>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex gap-2 relative">
            {categories.filter(c => c.label !== "Admin").map((category) => {
              const isActive = isActiveCategory(category);
              const isOpen = openDropdown === category.label;

              return (
                <div key={category.label} className="relative">
                  <button
                    onClick={() => toggleDropdown(category.label)}
                    className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? "bg-gray-700 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-800"
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
                      {category.items.map((item, idx) => {
                        if (item.href === "---") {
                          return <div key={`sep-${idx}`} className="border-t border-gray-200 my-1" />;
                        }
                        const active = isItemActive(item);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpenDropdown(null)}
                            className={`block px-4 py-2 text-sm transition-colors ${
                              active
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                      {category.sections?.map((section, sectionIndex) => (
                        <div key={section.section}>
                          {(category.items.length > 0 || sectionIndex > 0) && (
                            <div className="border-t border-gray-200 my-1" />
                          )}
                          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {section.section}
                          </div>
                          {section.items.map((item) => {
                            const active = pathname === item.href;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpenDropdown(null)}
                                className={`block px-4 py-2 transition-colors ${
                                  active
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                <div className={`text-sm ${active ? "font-medium" : ""}`}>
                                  {item.label}
                                </div>
                                {item.description && (
                                  <div className={`text-xs mt-0.5 ${active ? "text-blue-600" : "text-gray-500"}`}>
                                    {item.description}
                                  </div>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right side - Admin dropdown + Sign Out (desktop) */}
          <div className="hidden lg:flex gap-2 items-center">
            {categories.filter(c => c.label === "Admin").map((category) => {
              const isActive = isActiveCategory(category);
              const isOpen = openDropdown === category.label;

              return (
                <div key={category.label} className="relative">
                  <button
                    onClick={() => toggleDropdown(category.label)}
                    className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? "bg-gray-700 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    {category.Icon && <category.Icon className="w-5 h-5 flex-shrink-0" />}
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
                    <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[280px] z-50">
                      {category.sections?.map((section, sectionIndex) => (
                        <div key={section.section}>
                          {sectionIndex > 0 && (
                            <div className="border-t border-gray-200 my-1" />
                          )}
                          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {section.section}
                          </div>
                          {section.items.map((item) => {
                            const active = pathname === item.href;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpenDropdown(null)}
                                className={`block px-4 py-2 transition-colors ${
                                  active
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                <div className={`text-sm ${active ? "font-medium" : ""}`}>
                                  {item.label}
                                </div>
                                {item.description && (
                                  <div className={`text-xs mt-0.5 ${active ? "text-blue-600" : "text-gray-500"}`}>
                                    {item.description}
                                  </div>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <Link
              href="/sign-out"
              className="px-4 py-2 rounded-md font-medium transition-colors text-white hover:bg-gray-800 bg-gray-700"
            >
              Sign Out
            </Link>
          </div>

          {/* Mobile: Sign Out button visible */}
          <div className="flex lg:hidden">
            <Link
              href="/sign-out"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-white bg-gray-700 hover:bg-gray-600"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      <DisclosurePanel className="lg:hidden">
        <div className="space-y-1 px-3 pb-4 pt-2">
          {categories.map((category) => {
            const isActive = isActiveCategory(category);
            const isExpanded = mobileExpandedCategory === category.label;
            const allItems = [
              ...category.items.filter(i => i.href !== "---"),
              ...(category.sections?.flatMap(s => s.items) || [])
            ];

            return (
              <div key={category.label}>
                <button
                  onClick={() => toggleMobileCategory(category.label)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium cursor-pointer ${
                    isActive
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {category.iconLetter ? (
                      <div className="w-5 h-5 flex-shrink-0 rounded flex items-center justify-center text-sm font-bold">
                        {category.iconLetter}
                      </div>
                    ) : category.Icon ? (
                      <category.Icon className="w-5 h-5 flex-shrink-0" />
                    ) : null}
                    {category.label}
                  </div>
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                {isExpanded && (
                  <div className="mt-1 ml-4 space-y-1">
                    {allItems.map((item) => {
                      const active = isItemActive(item);
                      return (
                        <DisclosureButton
                          key={item.href}
                          as={Link}
                          href={item.href}
                          className={`block px-3 py-2 rounded-md text-sm ${
                            active
                              ? "bg-gray-700 text-white font-medium"
                              : "text-gray-400 hover:bg-gray-800 hover:text-white"
                          }`}
                        >
                          {item.label}
                        </DisclosureButton>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}
