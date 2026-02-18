"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { PresentationChartBarIcon } from "@heroicons/react/24/outline";

const GRADE_OPTIONS = [
  { href: "/scm/workedExamples/viewer?grade=6", label: "Grade 6" },
  { href: "/scm/workedExamples/viewer?grade=7", label: "Grade 7" },
  { href: "/scm/workedExamples/viewer?grade=8", label: "Grade 8" },
  { href: "/scm/workedExamples/viewer?grade=alg1", label: "Algebra 1" },
];

export function PublicSCMNav() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Build current URL for redirect after sign-in
  const currentUrl = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;
  const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(currentUrl)}`;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
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

  const currentGrade = searchParams.get("grade");
  const currentLabel =
    GRADE_OPTIONS.find((opt) => opt.href.includes(`grade=${currentGrade}`))
      ?.label || "Worked Examples";

  return (
    <nav
      className={`bg-gray-900 shadow-lg sticky top-0 z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
      ref={dropdownRef}
    >
      <div className="mx-auto px-4 lg:px-6 py-3" style={{ maxWidth: "1600px" }}>
        <div className="flex justify-between items-center">
          {/* Left side - Grade dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 cursor-pointer bg-gray-700 text-white hover:bg-gray-600"
            >
              <PresentationChartBarIcon className="w-5 h-5 flex-shrink-0" />
              {currentLabel}
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
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px] z-50">
                {GRADE_OPTIONS.map((item) => {
                  const isActive = item.href.includes(`grade=${currentGrade}`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-2 text-sm transition-colors ${
                        isActive
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

          {/* Right side - Sign In button (matches Sign Out style from SCMNav) */}
          <Link
            href={signInUrl}
            className="px-4 py-2 rounded-md font-medium transition-colors text-white hover:bg-gray-800 bg-gray-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}
