'use client';

import Link from 'next/link';

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary-200 text-white p-4">
        <h2 className="text-lg font-semibold">IM Tools</h2>
        <nav className="mt-4">
          <ul>
            <li>
              <Link href="/tools/im-routines" className="block p-2">
                IM Routines
              </Link>
            </li>
            <li>
              <Link href="/tools/rubric-viewer" className="block p-2">
                IMplementation Reflection Tool
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