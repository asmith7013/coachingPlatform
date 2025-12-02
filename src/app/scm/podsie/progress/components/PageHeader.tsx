interface PageHeaderProps {
  onCreateClick?: () => void;
}

export function PageHeader({ onCreateClick: _onCreateClick }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Podsie Assignment Progress</h1>
        <p className="text-gray-600">
          Track student progress on Podsie assignments by question
        </p>
      </div>
      {/* Commented out - can be enabled when needed */}
      {/* {onCreateClick && (
        <button
          onClick={onCreateClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors cursor-pointer"
        >
          <PlusIcon className="w-5 h-5" />
          Create Assignment
        </button>
      )} */}
    </div>
  );
}
