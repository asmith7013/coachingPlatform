import React from 'react';
import { ConfirmationDialog } from '@/components/composed/dialogs/ConfirmationDialog';
import { getTotalBlocksCount } from './utils';
import type { VisitScheduleBlock } from '@zod-schema/schedules/schedule-events';

interface ClearScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  visits: VisitScheduleBlock[];
  isLoading?: boolean;
}

/**
 * ClearScheduleDialog Component
 * 
 * Dedicated dialog for confirming schedule clearing operations.
 * Uses VisitScheduleBlock exclusively - no dual-mode support.
 */
export function ClearScheduleDialog({
  isOpen,
  onClose,
  onConfirm,
  visits,
  isLoading = false
}: ClearScheduleDialogProps) {
  const totalBlocks = getTotalBlocksCount(visits);

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Clear Schedule?"
      message={
        `This will permanently delete all ${totalBlocks} scheduled block${totalBlocks !== 1 ? 's' : ''} for this day. This action cannot be undone.`
      }
      confirmText={isLoading ? 'Clearing...' : 'Clear Schedule'}
      cancelText="Cancel"
      variant="danger"
      isLoading={isLoading}
    />
  );
} 