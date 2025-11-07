import Link from "next/link";

export default function IncentivesPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Incentives Tracker
          </h1>
          <p className="text-gray-600 mb-8">
            Track and manage student incentive activities
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Form Card */}
            <Link
              href="/incentives/form"
              className="block p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="text-4xl mb-3">📝</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                Form
              </h2>
              <p className="text-gray-600 text-sm">
                Log new student activities and incentives
              </p>
            </Link>

            {/* Data Card */}
            <Link
              href="/incentives/data"
              className="block p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="text-4xl mb-3">📊</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                Data
              </h2>
              <p className="text-gray-600 text-sm">
                View and analyze activity tracking data
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
