"use client";

import { tv } from "tailwind-variants";
import {
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import type { Visit } from "@zod-schema/visits/visit";

const visitSidebar = tv({
  slots: {
    container: "h-full flex flex-col bg-gray-50",
    section: "px-6 py-4 border-b border-gray-200",
    sectionTitle: "text-sm font-medium text-gray-900 mb-3",
    card: "bg-white rounded-lg p-4 shadow-sm border border-gray-200",
    cardHeader: "flex items-center space-x-2 mb-2",
    cardIcon: "h-4 w-4 text-gray-500",
    cardTitle: "text-sm font-medium text-gray-900",
    cardContent: "text-sm text-gray-600",
    listItem:
      "flex items-center justify-between py-2 border-b border-gray-100 last:border-0",
    listText: "text-sm text-gray-700",
    listAction: "text-xs text-indigo-600 hover:text-indigo-800",
  },
});

export interface VisitSidebarProps {
  visit: Visit;
}

export function VisitSidebar({ visit }: VisitSidebarProps) {
  const styles = visitSidebar();

  // Mock data for demonstration
  const actionPlanGoals = [
    "Implement guided reading groups",
    "Increase student engagement in math",
    "Develop classroom management strategies",
  ];

  const weeklyFocus = "Math manipulatives and hands-on learning";

  const nextSteps = [
    "Review lesson plans with coach",
    "Practice new questioning techniques",
    "Gather student work samples",
  ];

  return (
    <div className={styles.container()}>
      {/* Visit Details */}
      <div className={styles.section()}>
        <h3 className={styles.sectionTitle()}>Visit Details</h3>
        <div className="space-y-3">
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Purpose
            </span>
            <p className="text-sm text-gray-900 mt-1">
              {visit.allowedPurpose || "Visit"}
            </p>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Mode
            </span>
            <p className="text-sm text-gray-900 mt-1">
              {visit.modeDone || "In-person"}
            </p>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Grade Levels
            </span>
            <p className="text-sm text-gray-900 mt-1">
              {visit.gradeLevelsSupported?.join(", ") || "All grades"}
            </p>
          </div>
        </div>
      </div>

      {/* Action Plan Goals */}
      <div className={styles.section()}>
        <h3 className={styles.sectionTitle()}>Action Plan Goals</h3>
        <div className={styles.card()}>
          <div className={styles.cardHeader()}>
            <ClipboardDocumentListIcon className={styles.cardIcon()} />
            <span className={styles.cardTitle()}>Current Goals</span>
          </div>
          <div className="space-y-2">
            {actionPlanGoals.map((goal, index) => (
              <div key={index} className={styles.listItem()}>
                <span className={styles.listText()}>{goal}</span>
                <ArrowRightIcon className="h-3 w-3 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Focus */}
      <div className={styles.section()}>
        <h3 className={styles.sectionTitle()}>This Week&apos;s Focus</h3>
        <div className={styles.card()}>
          <div className={styles.cardHeader()}>
            <BookOpenIcon className={styles.cardIcon()} />
            <span className={styles.cardTitle()}>Focus Area</span>
          </div>
          <p className={styles.cardContent()}>{weeklyFocus}</p>
        </div>
      </div>

      {/* Next Steps */}
      <div className={styles.section()}>
        <h3 className={styles.sectionTitle()}>Next Steps</h3>
        <div className={styles.card()}>
          <div className="space-y-2">
            {nextSteps.map((step, index) => (
              <div key={index} className={styles.listItem()}>
                <span className={styles.listText()}>{step}</span>
                <button className={styles.listAction()}>Mark Done</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
