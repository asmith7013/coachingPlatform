"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  MapIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowRightStartOnRectangleIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { useViewAs, useSkillsHubAuth, type ViewRole } from "./ViewAsContext";

type NavItem = { href: string; label: string };

type NavCategory = {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  adminOnly?: boolean;
};

const ROLE_LABELS: Record<ViewRole, string> = {
  teacher: "Teacher",
  coach: "Coach",
  admin: "Admin",
};

export function SkillsHubNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { viewRole, setViewRole, teacherStaffId } = useViewAs();
  const mockUser = useSkillsHubAuth();
  const [fabOpen, setFabOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState<
    string | null
  >(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isAdmin = viewRole === "admin";
  const isTeacher = viewRole === "teacher";

  const initials = mockUser.fullName
    ? mockUser.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  // Close FAB when clicking outside
  useEffect(() => {
    function handleClickOutsideFab(event: MouseEvent) {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setFabOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutsideFab);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideFab);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutsideProfile(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutsideProfile);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideProfile);
  }, []);

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

  const teacherSkillsHref = mockUser.metadata.staffId
    ? `/skillsHub/teacher/${mockUser.metadata.staffId}`
    : "/skillsHub";

  // Standalone nav links (not in dropdowns)
  const standaloneLinks: NavItem[] = [];

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
              { href: "/skillsHub/coach/caseload", label: "Caseload" },
              { href: "/skillsHub/coach/skill-map", label: "Skill Map" },
              { href: "/skillsHub/coach/observations", label: "Observations" },
              {
                href: "/skillsHub/coach/skill-progressions",
                label: "Skill Progressions",
              },
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
    <>
      <nav ref={dropdownRef} className="bg-gray-900 sticky top-0 z-50">
        <div
          className="mx-auto px-4 lg:px-6 py-3"
          style={{ maxWidth: "1600px" }}
        >
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
            <div className="hidden lg:flex gap-2 relative items-center">
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

            {/* Right side: profile avatar dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-9 h-9 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center cursor-pointer hover:bg-indigo-500 transition-colors"
              >
                {initials}
              </button>

              {profileOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-3 min-w-[240px] z-50">
                  <div className="px-4 pb-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {mockUser.fullName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {mockUser.email}
                    </p>
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                      {ROLE_LABELS[viewRole]}
                    </span>
                  </div>
                  <div className="pt-2 px-2">
                    <Link
                      href="/sign-out"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                      Sign Out
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="lg:hidden">
            <div className="space-y-1 px-3 pb-4 pt-2">
              {/* Mobile user profile */}
              <div className="px-3 py-2 mb-2 border-b border-gray-700">
                <p className="text-sm font-medium text-white">
                  {mockUser.fullName}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{mockUser.email}</p>
                <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 font-medium">
                  {ROLE_LABELS[viewRole]}
                </span>
              </div>

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

      {/* Floating role-switcher FAB */}
      <div ref={fabRef} className="fixed bottom-6 right-6 z-[200]">
        {fabOpen && (
          <div className="absolute bottom-14 right-0 bg-gray-900 rounded-lg shadow-xl border border-gray-700 p-5 min-w-[180px]">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">
              View as
            </p>
            {(["teacher", "coach", "admin"] as ViewRole[]).map((role) => {
              const roleHome: Record<ViewRole, string> = {
                teacher: teacherStaffId
                  ? `/skillsHub/teacher/${teacherStaffId}`
                  : "/skillsHub",
                coach: "/skillsHub/coach/caseload",
                admin: "/skillsHub/admin/assignments",
              };
              return (
                <button
                  key={role}
                  onClick={() => {
                    setViewRole(role);
                    router.push(roleHome[role]);
                    setFabOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${
                    viewRole === role
                      ? "bg-indigo-600 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  {ROLE_LABELS[role]}
                </button>
              );
            })}
          </div>
        )}
        <button
          onClick={() => setFabOpen(!fabOpen)}
          className="w-9 h-9 rounded-full bg-gray-900 border border-gray-600 shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors"
        >
          <WrenchScrewdriverIcon className="w-5 h-5 text-white" />
        </button>
      </div>
    </>
  );
}
