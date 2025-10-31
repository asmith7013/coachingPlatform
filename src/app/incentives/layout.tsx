import Link from "next/link";

export default function IncentivesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-1">
            <Link
              href="/incentives/form"
              className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
            >
              📝 Form
            </Link>
            <Link
              href="/incentives/data"
              className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
            >
              📊 Data
            </Link>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      {children}
    </div>
  );
}
