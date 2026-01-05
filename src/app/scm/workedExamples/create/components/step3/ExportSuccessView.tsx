'use client';

interface ExportSuccessViewProps {
  savedSlug: string;
  googleSlidesUrl: string | null;
  unitNumber: number | null;
  lessonNumber: number | null;
  onCreateAnother: () => void;
}

export function ExportSuccessView({
  savedSlug,
  googleSlidesUrl,
  unitNumber,
  lessonNumber,
  onCreateAnother,
}: ExportSuccessViewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 text-center py-12 space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Exported to Google Slides!</h2>
        <p className="text-gray-600 mt-2">
          {unitNumber && lessonNumber
            ? `Unit ${unitNumber} Lesson ${lessonNumber} has been saved and exported.`
            : 'Your worked example has been saved and exported.'}
        </p>
      </div>

      <div className="flex flex-col gap-3 max-w-sm mx-auto">
        {googleSlidesUrl && (
          <a
            href={googleSlidesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-9 15H6v-4.5h4.5V18zm0-6H6v-4.5h4.5V12zm6 6h-4.5v-4.5H16.5V18zm0-6h-4.5v-4.5H16.5V12z" />
            </svg>
            Open in Google Slides
          </a>
        )}
        <a
          href={`/scm/workedExamples/viewer?view=${savedSlug}`}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
        >
          View Deck
        </a>
        <button
          onClick={onCreateAnother}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer border border-gray-300"
        >
          Create Another
        </button>
      </div>
    </div>
  );
}
