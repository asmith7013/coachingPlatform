'use client';

import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary text-white p-4">
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <nav className="mt-4">
          <ul>
            <li>
              <Link href="/dashboard" className="block p-2">
                Home
              </Link>
            </li>
            <li>
              <Link href="/dashboard/schoolList" className="block p-2">
                Schools
              </Link>
            </li>
            <li>
              <Link href="/dashboard/staffList" className="block p-2">
                People
              </Link>
            </li>
            <li>
              <Link href="/dashboard/lookForList" className="block p-2">
                Look Fors Bank
              </Link>
            </li>
            {/* --- IM Tools section ---------------------------------- */}
            <li className="mt-6 mb-1 text-xs uppercase tracking-wider text-gray-300">
              IM Tools
            </li>
            <li>
              <Link href="/tools/im-routines" className="block p-2">
                IM Routines
              </Link>
            </li>
            <li>
              <Link href="/tools/rubric-viewer" className="block p-2">
                Rubric Viewer
              </Link>
            </li>

            {/* --- Developer section ---------------------------------- */}
            <li className="mt-6 mb-1 text-xs uppercase tracking-wider text-gray-300">
              Developer
            </li>
            <li>
              <Link
                href="/tools/dev/seed-data"
                className="block p-2 text-yellow-300 hover:text-yellow-200"
              >
                Seed Mock Data
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100">{children}</main>
    </div>
  );
}