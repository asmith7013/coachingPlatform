export default function SkillsHubPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="max-w-md space-y-6">
        {/* Upward arrow */}
        <div className="text-gray-300">
          <svg
            className="mx-auto w-16 h-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to Skills Hub
        </h1>

        <p className="text-lg text-gray-500">
          Use the navigation bar above to get started.
        </p>
      </div>
    </div>
  );
}
