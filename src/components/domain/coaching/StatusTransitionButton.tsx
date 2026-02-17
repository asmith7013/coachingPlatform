import React, { useState } from "react";
import { Button } from "@components/core/Button";
import { Select } from "@components/core/fields/Select";
import { Dialog } from "@components/composed/dialogs/Dialog";
import { Text } from "@components/core/typography/Text";
import { Badge } from "@components/core/feedback/Badge";
import { ArrowRight as _ArrowRightIcon, AlertCircle } from "lucide-react";
import {
  statusWorkflow,
  getStatusColor,
  getStatusLabel,
  type PlanStatus,
} from "@data-processing/transformers/utils/coaching-action-plan-utils";
import type { CoachingActionPlan } from "@zod-schema/core/cap";
import { createCoachingActionPlanDefaults } from "@zod-schema/core/cap";

interface StatusTransitionButtonProps {
  plan: CoachingActionPlan & { _id: string };
  onStatusChange: (
    planId: string,
    newStatus: PlanStatus,
    reason?: string,
  ) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function StatusTransitionButton({
  plan,
  onStatusChange,
  // disabled = false,
  // className
}: StatusTransitionButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<PlanStatus | "">("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get available transitions for this plan
  const fullPlan = createCoachingActionPlanDefaults(plan);
  const availableStatuses = statusWorkflow.getNextStatuses(
    plan.status as PlanStatus,
    fullPlan as unknown as CoachingActionPlan,
  );

  if (availableStatuses.length === 0) {
    return null; // No transitions available
  }

  const handleStatusChange = async () => {
    if (!selectedStatus) return;

    setIsLoading(true);
    try {
      await onStatusChange(plan._id, selectedStatus, reason);
      setIsModalOpen(false);
      setSelectedStatus("");
      setReason("");
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTransitionDescription = (toStatus: PlanStatus) => {
    return (
      statusWorkflow.transitions.find(
        (t) => t.from === plan.status && t.to === toStatus,
      )?.description || ""
    );
  };

  const validateTransition = (toStatus: PlanStatus) => {
    return statusWorkflow.validateTransition(
      plan.status as PlanStatus,
      toStatus,
      fullPlan as unknown as CoachingActionPlan,
    );
  };

  return (
    <>
      {/* <Button
        intent="secondary"
        appearance="outline"
        padding="sm"
        onClick={() => setIsModalOpen(true)}
        disabled={disabled}
        className={className}
      >
        <ArrowRight className="h-4 w-4" />
        Change Status
      </Button> */}

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Change Plan Status"
        size="md"
      >
        {/* Current Status */}
        <div className="mb-4">
          <Text textSize="sm" color="muted" className="mb-2">
            Current Status
          </Text>
          <Badge
            intent={
              getStatusColor(plan.status as PlanStatus) as
                | "primary"
                | "secondary"
                | "danger"
                | "success"
                | "neutral"
                | "info"
                | "warning"
            }
            size="sm"
          >
            {getStatusLabel(plan.status as PlanStatus)}
          </Badge>
        </div>

        {/* Status Selection */}
        <div className="mb-4">
          <Text textSize="sm" color="muted" className="mb-2">
            New Status
          </Text>
          <Select
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value as PlanStatus)}
            placeholder="Select new status..."
            options={availableStatuses.map((status) => {
              const validation = validateTransition(status);
              const isDisabled = !validation.valid;

              return {
                value: status,
                label: `${getStatusLabel(status)} - ${getTransitionDescription(status)}`,
                disabled: isDisabled,
              };
            })}
          />

          {selectedStatus &&
            (() => {
              const validation = validateTransition(selectedStatus);
              if (!validation.valid) {
                return (
                  <div className="mt-2 p-3 bg-danger-50 border border-danger-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-danger" />
                      <Text textSize="sm" color="danger">
                        Cannot transition to {getStatusLabel(selectedStatus)}
                      </Text>
                    </div>
                    <ul className="mt-2 list-disc list-inside">
                      {validation.errors.map((error, index) => (
                        <li key={index}>
                          <Text textSize="xs" color="danger">
                            {error}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }
              return null;
            })()}
        </div>

        {/* Reason (optional) */}
        <div className="mb-6">
          <Text textSize="sm" color="muted" className="mb-2">
            Reason for Change (optional)
          </Text>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide a reason for this status change..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            intent="secondary"
            appearance="outline"
            onClick={() => setIsModalOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={handleStatusChange}
            disabled={
              !selectedStatus ||
              isLoading ||
              (selectedStatus && !validateTransition(selectedStatus).valid)
            }
            loading={isLoading}
          >
            Update Status
          </Button>
        </div>
      </Dialog>
    </>
  );
}
