"use client";

import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface ReauthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReauth: () => void;
}

export function ReauthModal({ isOpen, onClose, onReauth }: ReauthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <ArrowPathIcon className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Google Authorization Expired
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Your Google connection needs to be refreshed to export to Google
              Slides. You&apos;ll be signed out and redirected to sign back in
              with Google.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={onReauth}
                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Reconnect Google
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
