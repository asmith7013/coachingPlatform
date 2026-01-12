'use client';

interface ExportSuccessModalProps {
  isOpen: boolean;
  googleSlidesUrl: string | null;
  onOpenSlides: () => void;
  onOpenBrowserView: () => void;
  onKeepEditing: () => void;
}

export function ExportSuccessModal({
  isOpen,
  googleSlidesUrl,
  onOpenSlides,
  onOpenBrowserView,
  onKeepEditing,
}: ExportSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 text-center mb-1">
          Export Complete!
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          Your deck has been saved and exported to Google Slides.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {googleSlidesUrl && (
            <button
              onClick={onOpenSlides}
              className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-9 15H6v-4.5h4.5V18zm0-6H6v-4.5h4.5V12zm6 6h-4.5v-4.5H16.5V18zm0-6h-4.5v-4.5H16.5V12z" />
              </svg>
              Open Slides
            </button>
          )}
          <button
            onClick={onOpenBrowserView}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Open Browser View
          </button>
          <button
            onClick={onKeepEditing}
            className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors cursor-pointer border border-gray-300"
          >
            Keep Editing
          </button>
        </div>
      </div>
    </div>
  );
}
