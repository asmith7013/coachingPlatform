'use client';

import Link from 'next/link';

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4">
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
              <Link href="/dashboard/schoolList" className="block p-2">
                People
              </Link>
            </li>
            <li>
              <Link href="/dashboard/lookForList" className="block p-2">
                Look Fors Bank
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