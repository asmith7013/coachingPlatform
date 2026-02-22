"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useClerk } from "@clerk/nextjs";
import {
  useWorkedExampleDecks,
  useGradeUnitPairs,
  workedExampleDecksKeys,
} from "../hooks";
import type { WorkedExampleDeck } from "@zod-schema/scm/worked-example";
import { PresentationModal } from "../presentations";
import { ConfirmationDialog } from "@/components/composed/dialogs/ConfirmationDialog";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  ShieldExclamationIcon,
  BookOpenIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { deactivateDeck } from "@/app/actions/worked-examples";
import Link from "next/link";
import { PLANNING_STEPS } from "../presentations/planningSteps";

// Map URL param to scopeSequenceTag in database
const GRADE_OPTIONS = [
  { value: "", label: "All Grades", scopeSequenceTag: "" },
  { value: "6", label: "Grade 6", scopeSequenceTag: "Grade 6" },
  { value: "7", label: "Grade 7", scopeSequenceTag: "Grade 7" },
  { value: "8", label: "Grade 8", scopeSequenceTag: "Grade 8" },
  { value: "alg1", label: "Algebra 1", scopeSequenceTag: "Algebra 1" },
];

// Grade selection cards for the landing view
const GRADE_CARDS = [
  {
    value: "6",
    label: "Grade 6",
    borderColor: "border-blue-300",
    hoverBg: "hover:bg-blue-50",
    textColor: "text-blue-700",
  },
  {
    value: "7",
    label: "Grade 7",
    borderColor: "border-green-300",
    hoverBg: "hover:bg-green-50",
    textColor: "text-green-700",
  },
  {
    value: "8",
    label: "Grade 8",
    borderColor: "border-purple-300",
    hoverBg: "hover:bg-purple-50",
    textColor: "text-purple-700",
  },
  {
    value: "alg1",
    label: "Algebra 1",
    borderColor: "border-orange-300",
    hoverBg: "hover:bg-orange-50",
    textColor: "text-orange-700",
  },
];

// Skeleton loader for unit accordion
function UnitAccordionSkeleton() {
  return (
    <div className="bg-gray-100 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-6 w-48 bg-gray-300 rounded" />
          <div className="h-5 w-16 bg-gray-300 rounded" />
        </div>
        <div className="h-5 w-5 bg-gray-300 rounded" />
      </div>
    </div>
  );
}

// Planning Guide Accordion Component
function PlanningGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6 bg-blue-50 rounded-lg shadow-sm border border-blue-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <BookOpenIcon className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-semibold text-blue-800">
            Planning Guide
          </h2>
        </div>
        {isOpen ? (
          <ChevronDownIcon className="w-5 h-5 text-blue-600" />
        ) : (
          <ChevronRightIcon className="w-5 h-5 text-blue-600" />
        )}
      </button>
      {isOpen && (
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANNING_STEPS.map((step) => (
              <div
                key={step.step}
                className="bg-white border border-blue-100 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                    {step.step}
                  </span>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {step.title}
                  </h3>
                </div>
                <ul className="space-y-1.5">
                  {step.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start text-sm text-gray-600"
                    >
                      <span className="mr-2 text-blue-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                  {step.subItems && (
                    <ul className="ml-4 mt-1 space-y-1">
                      {step.subItems.map((subItem, idx) => (
                        <li
                          key={idx}
                          className="flex items-start text-sm text-gray-500"
                        >
                          <span className="mr-2 text-gray-300">–</span>
                          <span>{subItem}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PresentationsList() {
  const [deactivateModalDeck, setDeactivateModalDeck] =
    useState<WorkedExampleDeck | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [openUnits, setOpenUnits] = useState<Set<string>>(new Set()); // Track open accordions - all closed by default
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const clerk = useClerk();
  const openSlug = searchParams.get("view");
  const slideParam = searchParams.get("slide");
  const initialSlide = slideParam
    ? Math.max(0, parseInt(slideParam, 10) - 1)
    : 0; // Convert 1-indexed URL to 0-indexed
  const gradeFilter = searchParams.get("grade") || "";

  // Get scopeSequenceTag from grade filter
  const scopeSequenceTag = useMemo(() => {
    return (
      GRADE_OPTIONS.find((o) => o.value === gradeFilter)?.scopeSequenceTag || ""
    );
  }, [gradeFilter]);

  // Data fetching with React Query
  const { decks, loading, error } = useWorkedExampleDecks();
  const { gradeUnitPairs, loading: gradeUnitPairsLoading } =
    useGradeUnitPairs(scopeSequenceTag);

  // Filter decks based on grade/unit pairs
  const filteredDecks = useMemo(() => {
    if (!gradeFilter) return decks;
    if (gradeUnitPairs.length === 0) return [];

    // Filter by matching deck's gradeLevel and unitNumber to any pair in the curriculum
    return decks.filter(
      (deck) =>
        deck.unitNumber !== undefined &&
        gradeUnitPairs.some(
          (pair) =>
            pair.grade === deck.gradeLevel &&
            pair.unitNumber === deck.unitNumber,
        ),
    );
  }, [decks, gradeFilter, gradeUnitPairs]);

  // Create a lookup map for unit info (unitNumber + grade -> unitName)
  const unitInfoMap = useMemo(() => {
    const map = new Map<string, { unitName: string; grade: string }>();
    for (const pair of gradeUnitPairs) {
      const key = `${pair.unitNumber}-${pair.grade}`;
      map.set(key, { unitName: pair.unitName, grade: pair.grade });
    }
    return map;
  }, [gradeUnitPairs]);

  const handleGradeChange = (newGrade: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newGrade) {
      params.set("grade", newGrade);
    } else {
      params.delete("grade");
    }
    // Preserve the view param if it exists
    router.push(
      `/scm/workedExamples/viewer${params.toString() ? `?${params.toString()}` : ""}`,
      { scroll: false },
    );
  };

  const handleCardClick = (deck: WorkedExampleDeck) => {
    handleOpenPresentation(deck.slug);
  };

  const handleOpenPresentation = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", slug);
    router.push(`/scm/workedExamples/viewer?${params.toString()}`, {
      scroll: false,
    });
  };

  const handleClosePresentation = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    params.delete("slide");
    router.push(
      `/scm/workedExamples/viewer${params.toString() ? `?${params.toString()}` : ""}`,
      { scroll: false },
    );
  };

  const handleSlideChange = (slideIndex: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("slide", String(slideIndex + 1)); // Convert 0-indexed to 1-indexed for URL
    router.replace(`/scm/workedExamples/viewer?${params.toString()}`, {
      scroll: false,
    });
  };

  const toggleUnit = (unitName: string) => {
    setOpenUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitName)) {
        next.delete(unitName);
      } else {
        next.add(unitName);
      }
      return next;
    });
  };

  const handleDeactivateClick = (
    e: React.MouseEvent,
    deck: WorkedExampleDeck,
  ) => {
    e.stopPropagation();
    setDeactivateModalDeck(deck);
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivateModalDeck) return;

    setIsDeactivating(true);
    try {
      const result = await deactivateDeck(deactivateModalDeck.slug);
      if (result.success) {
        // Invalidate the query to refresh the list
        queryClient.invalidateQueries({ queryKey: workedExampleDecksKeys.all });
        setDeactivateModalDeck(null);
      } else {
        setDeactivateModalDeck(null);
        // Check if it's a session error (not logged in) vs permission error (not the owner)
        if (result.error?.includes("logged in")) {
          setShowReauthModal(true);
        } else if (result.error?.includes("permission")) {
          setPermissionError(result.error);
        } else {
          console.error("Failed to deactivate:", result.error);
        }
      }
    } catch (error) {
      console.error("Error deactivating deck:", error);
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleReauth = async () => {
    const currentPath = window.location.pathname + window.location.search;
    await clerk.signOut();
    window.location.href = `/sign-in?redirect_url=${encodeURIComponent(currentPath)}`;
  };

  // Determine if we're in a loading state for the grade-filtered view
  const isLoadingDecks = loading || (gradeFilter && gradeUnitPairsLoading);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-600">{error}</p>
      </div>
    );
  }

  // Show grade selection when no grade is selected AND no deck is being viewed
  if (!gradeFilter && !openSlug) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Worked Example Presentations
          </h1>
          <p className="text-lg text-gray-600">
            Select a grade level to browse scaffolded guidance slide decks
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
          {GRADE_CARDS.map((grade) => (
            <button
              key={grade.value}
              onClick={() => handleGradeChange(grade.value)}
              className={`bg-white border-2 ${grade.borderColor} ${grade.hoverBg} rounded-xl shadow-sm p-8 text-center transition-all hover:shadow-md cursor-pointer`}
            >
              <div className={`text-2xl font-bold ${grade.textColor}`}>
                {grade.label}
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/scm/workedExamples/deactivated"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArchiveBoxIcon className="w-4 h-4" />
            View Deactivated
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {GRADE_OPTIONS.find((o) => o.value === gradeFilter)?.label ||
                "Worked Examples"}
            </h1>
            <p className="text-gray-600">
              Browse and view scaffolded guidance slide decks
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleGradeChange("")}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              ← All Grades
            </button>
            <Link
              href="/scm/workedExamples/manage"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Manage
            </Link>
            <Link
              href="/scm/workedExamples/deactivated"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArchiveBoxIcon className="w-4 h-4" />
              Deactivated
            </Link>
          </div>
        </div>

        <PlanningGuide />

        {isLoadingDecks ? (
          <div className="space-y-4">
            {/* Show skeleton loaders while loading */}
            {[1, 2, 3].map((i) => (
              <UnitAccordionSkeleton key={i} />
            ))}
          </div>
        ) : filteredDecks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              No presentations found for{" "}
              {GRADE_OPTIONS.find((o) => o.value === gradeFilter)?.label ||
                "selected grade"}
            </p>
            <button
              onClick={() => handleGradeChange("")}
              className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            >
              ← Back to all grades
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Group decks by unit */}
            {Object.entries(
              filteredDecks.reduce(
                (groups, deck) => {
                  // Group by unit number AND grade (important for Algebra 1 which has both Grade 8 and Algebra 1 content)
                  const unitKey =
                    deck.unitNumber !== undefined
                      ? `${deck.unitNumber}-${deck.gradeLevel}`
                      : "No Unit";
                  if (!groups[unitKey]) {
                    groups[unitKey] = [];
                  }
                  groups[unitKey].push(deck);
                  return groups;
                },
                {} as Record<string, WorkedExampleDeck[]>,
              ),
            )
              .sort(([a], [b]) => {
                // Sort by unit number, "No Unit" goes last
                if (a === "No Unit") return 1;
                if (b === "No Unit") return -1;
                const numA = parseInt(a.split("-")[0]);
                const numB = parseInt(b.split("-")[0]);
                return numA - numB;
              })
              .map(([unitKey, unitDecks]) => {
                const isOpen = openUnits.has(unitKey);
                // Parse unit number and grade from key
                const [unitNumStr, ...gradeParts] = unitKey.split("-");
                const unitNumber = parseInt(unitNumStr);
                const deckGrade =
                  gradeParts.join("-") || unitDecks[0]?.gradeLevel;

                // Look up the unit info for full title
                const unitInfo = unitInfoMap.get(`${unitNumber}-${deckGrade}`);
                const unitTitle = unitInfo?.unitName
                  ? unitInfo.unitName
                  : unitKey === "No Unit"
                    ? "No Unit"
                    : `Unit ${unitNumber}`;

                // For Algebra 1 filter, show which grade content this is
                const showGradeBadge = gradeFilter === "alg1" && deckGrade;
                const gradeBadgeText =
                  deckGrade === "8" ? "Grade 8" : deckGrade;

                return (
                  <div
                    key={unitKey}
                    className="bg-gray-100 rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleUnit(unitKey)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-800">
                          {unitTitle}
                        </h2>
                        {showGradeBadge && (
                          <span
                            className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${
                              deckGrade === "8"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-indigo-100 text-indigo-700"
                            }`}
                          >
                            {gradeBadgeText}
                          </span>
                        )}
                        <span className="text-sm font-normal text-gray-500">
                          ({unitDecks.length}{" "}
                          {unitDecks.length === 1 ? "deck" : "decks"})
                        </span>
                      </div>
                      {isOpen ? (
                        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="p-4">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                          {unitDecks
                            .sort(
                              (a, b) =>
                                (a.lessonNumber || 0) - (b.lessonNumber || 0),
                            )
                            .map((deck) => (
                              <div
                                key={deck.slug}
                                className="relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
                              >
                                {/* Deactivate button */}
                                <button
                                  onClick={(e) =>
                                    handleDeactivateClick(e, deck)
                                  }
                                  className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                                  title="Deactivate this worked example"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleCardClick(deck)}
                                  className="block p-6 text-left w-full cursor-pointer"
                                >
                                  <div className="mb-4 flex items-center gap-2 flex-wrap pr-6">
                                    <span className="inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded">
                                      {deck.gradeLevel === "Algebra 1"
                                        ? "Algebra 1"
                                        : `Grade ${deck.gradeLevel}`}
                                    </span>
                                    {deck.lessonNumber !== undefined && (
                                      <span className="inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded">
                                        Lesson {deck.lessonNumber}
                                      </span>
                                    )}
                                    {deck.googleSlidesUrl && (
                                      <a
                                        href={deck.googleSlidesUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded transition-colors"
                                        title="Open in Google Slides"
                                      >
                                        <svg
                                          className="w-3 h-3"
                                          viewBox="0 0 24 24"
                                          fill="currentColor"
                                        >
                                          <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-9 15H6v-4.5h4.5V18zm0-6H6v-4.5h4.5V12zm6 6h-4.5v-4.5H16.5V18zm0-6h-4.5v-4.5H16.5V12z" />
                                        </svg>
                                        Slides
                                      </a>
                                    )}
                                  </div>

                                  <h3 className="text-xl font-bold text-gray-900">
                                    {deck.title}
                                  </h3>

                                  {/* Learning Targets Section */}
                                  {deck.learningGoals &&
                                    deck.learningGoals.length > 0 && (
                                      <div className="mt-3 pt-3 border-t border-gray-100">
                                        <p className="text-xs font-medium text-gray-500 mb-1">
                                          Learning Targets:
                                        </p>
                                        <ul className="space-y-1 text-sm text-gray-600">
                                          {deck.learningGoals.map(
                                            (goal, idx) => (
                                              <li
                                                key={idx}
                                                className="flex items-start"
                                              >
                                                <span className="mr-2 text-gray-400">
                                                  •
                                                </span>
                                                <span>{goal}</span>
                                              </li>
                                            ),
                                          )}
                                        </ul>
                                      </div>
                                    )}

                                  {/* Standard Section */}
                                  {deck.mathStandard && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                      <p className="text-xs font-medium text-gray-500 mb-1">
                                        Standard:
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {deck.mathStandard}
                                      </p>
                                    </div>
                                  )}

                                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                                    {/* Status Row */}
                                    {!deck.isPublic && (
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>🔒 Private</span>
                                      </div>
                                    )}
                                    {/* Creation Data Row */}
                                    <div>
                                      <p className="text-xs font-medium text-gray-500 mb-1">
                                        Created:
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {(() => {
                                          const date = new Date(
                                            deck.createdAt!,
                                          );
                                          const dateStr =
                                            date.toLocaleDateString();
                                          const hours = date.getHours();
                                          const minutes = date
                                            .getMinutes()
                                            .toString()
                                            .padStart(2, "0");
                                          const ampm =
                                            hours >= 12 ? "PM" : "AM";
                                          const displayHours = hours % 12 || 12;
                                          const timeStr = `${displayHours}:${minutes} ${ampm}`;
                                          return (
                                            <span
                                              title={`${dateStr} at ${timeStr}`}
                                            >
                                              {dateStr}
                                            </span>
                                          );
                                        })()}
                                        {deck.createdBy && (
                                          <span> by {deck.createdBy}</span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Presentation Modal */}
      {openSlug && (
        <PresentationModal
          slug={openSlug}
          isOpen={!!openSlug}
          onClose={handleClosePresentation}
          initialSlide={initialSlide}
          onSlideChange={handleSlideChange}
        />
      )}

      {/* Deactivate Confirmation Modal */}
      <ConfirmationDialog
        isOpen={!!deactivateModalDeck}
        onClose={() => setDeactivateModalDeck(null)}
        onConfirm={handleConfirmDeactivate}
        title="Deactivate Worked Example"
        message={`Are you sure you want to deactivate "${deactivateModalDeck?.title}"? It will be hidden from the list but can be reactivated later.`}
        confirmText="Deactivate"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeactivating}
      />

      {/* Permission Error Modal */}
      {permissionError && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <ShieldExclamationIcon className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Permission Denied
                </h3>
                <p className="mt-2 text-sm text-gray-600">{permissionError}</p>
                <div className="mt-4">
                  <button
                    onClick={() => setPermissionError(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Re-auth Modal for session errors */}
      {showReauthModal && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <ArrowPathIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Session Needs Refresh
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Your session needs to be refreshed to modify this deck.
                  You&apos;ll be signed out and redirected to sign back in.
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleReauth}
                    className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    Sign In Again
                  </button>
                  <button
                    onClick={() => setShowReauthModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
