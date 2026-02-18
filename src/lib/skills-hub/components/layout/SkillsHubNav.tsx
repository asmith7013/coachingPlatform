"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  MapIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuthenticatedUser } from "@/hooks/auth/useAuthenticatedUser";

type NavItem = { href: string; label: string };

type NavCategory = {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  adminOnly?: boolean;
};

export function SkillsHubNav() {
  const pathname = usePathname();
  const { hasRole, metadata } = useAuthenticatedUser();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState<
    string | null
  >(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = hasRole("super_admin");
  const isDirector = hasRole("director");
  const isAdmin = isSuperAdmin || isDirector;
  const isCoach = hasRole("coach");
  const isTeacher = !isAdmin && !isCoach;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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

  const teacherSkillsHref = metadata.staffId
    ? `/skillsHub/teacher/${metadata.staffId}`
    : "/skillsHub";

  // Standalone nav links (not in dropdowns)
  const standaloneLinks: NavItem[] = [
    { href: "/skillsHub/skills", label: "All Skills" },
  ];

  const categories: NavCategory[] = [
    ...(isTeacher
      ? [
          {
            label: "My Skills",
            Icon: MapIcon,
            items: [{ href: teacherSkillsHref, label: "My Skill Map" }],
          },
        ]
      : []),
    ...(!isTeacher
      ? [
          {
            label: "Coaching",
            Icon: ClipboardDocumentCheckIcon,
            items: [
              { href: "/skillsHub/caseload", label: "Caseload" },
              { href: "/skillsHub/skill-map", label: "Skill Map" },
              { href: "/skillsHub/observations", label: "Observations" },
              { href: "/skillsHub/action-plans", label: "Action Plans" },
            ],
          },
        ]
      : []),
    {
      label: "Admin",
      Icon: Cog6ToothIcon,
      items: [{ href: "/skillsHub/admin/assignments", label: "Assignments" }],
      adminOnly: true,
    },
  ];

  const visibleCategories = categories.filter((c) => !c.adminOnly || isAdmin);

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const toggleMobileCategory = (label: string) => {
    setMobileExpandedCategory(mobileExpandedCategory === label ? null : label);
  };

  const isActiveCategory = (category: NavCategory) => {
    return category.items.some(
      (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
    );
  };

  const isItemActive = (item: NavItem) => {
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  return (
    <nav
      ref={dropdownRef}
      className={`bg-gray-900 shadow-lg sticky top-0 z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto px-4 lg:px-6 py-3" style={{ maxWidth: "1600px" }}>
        <div className="flex justify-between items-center gap-2">
          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer"
            >
              <span className="sr-only">Open main menu</span>
              {mobileOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex gap-2 relative">
            {standaloneLinks.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/skillsHub" &&
                  pathname.startsWith(link.href + "/"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    active
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {visibleCategories.map((category) => {
              const isActive = isActiveCategory(category);
              const isOpen = openDropdown === category.label;

              // Single-item categories render as direct links
              if (category.items.length === 1) {
                const item = category.items[0];
                return (
                  <Link
                    key={category.label}
                    href={item.href}
                    className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                      isActive
                        ? "bg-gray-700 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    <category.Icon className="w-5 h-5 flex-shrink-0" />
                    {category.label}
                  </Link>
                );
              }

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
                    <category.Icon className="w-5 h-5 flex-shrink-0" />
                    {category.label}
                    <svg
                      className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[200px] z-50">
                      {category.items.map((item) => {
                        const active = isItemActive(item);
                        return (
                          <Link
                            key={item.href + item.label}
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right side: Sign out */}
          <div className="flex gap-2 items-center">
            <Link
              href="/sign-out"
              className="px-4 py-2 rounded-md font-medium transition-colors text-white hover:bg-gray-800 bg-gray-700 flex items-center gap-2"
            >
              <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Sign Out</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="lg:hidden">
          <div className="space-y-1 px-3 pb-4 pt-2">
            {standaloneLinks.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/skillsHub" &&
                  pathname.startsWith(link.href + "/"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    active
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {visibleCategories.map((category) => {
              const isActive = isActiveCategory(category);
              const isExpanded = mobileExpandedCategory === category.label;

              if (category.items.length === 1) {
                const item = category.items[0];
                return (
                  <Link
                    key={category.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
                      isActive
                        ? "bg-gray-700 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <category.Icon className="w-5 h-5 flex-shrink-0" />
                    {category.label}
                  </Link>
                );
              }

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
                      <category.Icon className="w-5 h-5 flex-shrink-0" />
                      {category.label}
                    </div>
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="mt-1 ml-4 space-y-1">
                      {category.items.map((item) => {
                        const active = isItemActive(item);
                        return (
                          <Link
                            key={item.href + item.label}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`block px-3 py-2 rounded-md text-sm ${
                              active
                                ? "bg-gray-700 text-white font-medium"
                                : "text-gray-400 hover:bg-gray-800 hover:text-white"
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
        </div>
      )}
    </nav>
  );
}
