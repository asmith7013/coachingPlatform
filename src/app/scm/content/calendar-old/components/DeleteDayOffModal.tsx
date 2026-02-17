"use client";

import React, { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@/components/composed/dialogs/Dialog";
import { Spinner } from "@/components/core/feedback/Spinner";

interface DeleteDayOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, shiftSchedule: boolean) => Promise<void>;
  deleting: boolean;
  event: { date: string; name: string };
}

export function DeleteDayOffModal({
  isOpen,
  onClose,
  onConfirm,
  deleting,
  event,
}: DeleteDayOffModalProps) {
  const [shiftSchedule, setShiftSchedule] = useState(true);

  const handleConfirm = async () => {
    await onConfirm(event.date, shiftSchedule);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Delete Day Off"
      size="sm"
      padding="none"
    >
      <div className="px-6 py-4 space-y-4">
        <p className="text-sm text-gray-700">
          Are you sure you want to delete{" "}
          <span className="font-medium">{event.name}</span> on{" "}
          <span className="font-medium">
            {new Date(event.date + "T12:00:00").toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          ?
        </p>

        <div className="pt-2 border-t border-gray-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={shiftSchedule}
              onChange={(e) => setShiftSchedule(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700">
              Shift schedule back by 1 day
            </span>
          </label>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={deleting}
          className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={deleting}
          className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {deleting ? (
            <>
              <Spinner
                size="xs"
                variant="default"
                className="border-white border-t-red-200"
              />
              Deleting...
            </>
          ) : (
            <>
              <TrashIcon className="h-4 w-4" />
              Delete
            </>
          )}
        </button>
      </div>
    </Dialog>
  );
}
