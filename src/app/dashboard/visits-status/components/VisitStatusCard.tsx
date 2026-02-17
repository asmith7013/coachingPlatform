import React, { useState } from "react";
import { Card } from "@/components/composed/cards/Card";
import { Badge } from "@/components/core/feedback/Badge";
import { Text } from "@/components/core/typography/Text";
import { Switch } from "@/components/core/fields/Switch";
import { ConfirmationDialog } from "@/components/composed/dialogs/ConfirmationDialog";
import { Visit } from "@zod-schema/visits/visit";
import { useVisits } from "@hooks/domain/useVisits";
import { SubmitCoachingLogButton } from "@components/domain/visits/SubmitCoachingLogButton";
import {
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { formatMediumDate } from "@data-processing/transformers/utils/date-utils";

interface VisitStatusCardProps {
  visit: Visit;
}

// Helper function using existing date utilities with timezone fix
function formatVisitDate(date?: string): string {
  if (!date) return "No date";
  try {
    // Use the fixed formatMediumDate function which now handles ISO strings properly
    return formatMediumDate(date);
  } catch {
    return "Invalid date";
  }
}

export function VisitStatusCard({ visit }: VisitStatusCardProps) {
  const isLogComplete = visit.coachingLogSubmitted === true;
  const hasSchedule = !!visit.visitScheduleId;
  const formattedDate = formatVisitDate(visit.date);

  // State for toggle confirmation
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingToggleValue, setPendingToggleValue] = useState<boolean | null>(
    null,
  );

  // Visit mutations hook
  const { updateAsync, isUpdating } = useVisits.mutations();

  // Handle toggle click - show confirmation dialog
  const handleToggleClick = (newValue: boolean) => {
    setPendingToggleValue(newValue);
    setShowConfirmDialog(true);
  };

  // Handle confirmation - update the visit
  const handleConfirmToggle = async () => {
    if (pendingToggleValue === null || !updateAsync) return;

    try {
      await updateAsync(visit._id, {
        coachingLogSubmitted: pendingToggleValue,
      });
      setShowConfirmDialog(false);
      setPendingToggleValue(null);
    } catch {
      // Error handling is managed by the mutation hook
      setShowConfirmDialog(false);
      setPendingToggleValue(null);
    }
  };

  // Handle dialog cancel
  const handleCancelToggle = () => {
    setShowConfirmDialog(false);
    setPendingToggleValue(null);
  };

  return (
    <>
      <Card className="relative hover:shadow-md transition-shadow">
        <Card.Body>
          {/* Status Indicator */}
          <div className="flex items-center justify-between mb-3">
            <Badge
              intent={isLogComplete ? "success" : "danger"}
              size="sm"
              className="flex items-center gap-1"
            >
              {isLogComplete ? (
                <CheckCircleIcon className="h-3 w-3" />
              ) : (
                <XCircleIcon className="h-3 w-3" />
              )}
              {isLogComplete ? "Complete" : "Pending"}
            </Badge>

            {hasSchedule && (
              <div className="flex items-center text-blue-600">
                <CalendarIcon className="h-4 w-4" />
              </div>
            )}
          </div>

          {/* Visit Details */}
          <div className="space-y-2">
            <Text textSize="sm" weight="medium">
              {formattedDate}
            </Text>

            {visit.allowedPurpose && (
              <Text textSize="xs" color="muted">
                {visit.allowedPurpose}
              </Text>
            )}

            {visit.modeDone && (
              <Text textSize="xs" color="muted">
                Mode: {visit.modeDone}
              </Text>
            )}

            {/* Status Summary with Toggle */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Log:</span>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      isLogComplete ? "text-green-600" : "text-red-600"
                    }
                  >
                    {isLogComplete ? "✓" : "✗"}
                  </span>
                  <Switch
                    checked={isLogComplete}
                    onChange={handleToggleClick}
                    disabled={isUpdating}
                    textSize="xs"
                    className="scale-75"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Schedule:</span>
                <span
                  className={hasSchedule ? "text-green-600" : "text-gray-400"}
                >
                  {hasSchedule ? "✓" : "—"}
                </span>
              </div>
            </div>

            {/* Submit Coaching Log Button */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <SubmitCoachingLogButton
                visitId={visit._id}
                intent="primary"
                appearance="outline"
                textSize="xs"
              />
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={handleCancelToggle}
        onConfirm={handleConfirmToggle}
        title="Update Coaching Log Status"
        message={`Mark this coaching log as ${pendingToggleValue ? "complete" : "incomplete"}?`}
        confirmText={pendingToggleValue ? "Mark Complete" : "Mark Incomplete"}
        cancelText="Cancel"
        variant="info"
        isLoading={isUpdating}
      />
    </>
  );
}
