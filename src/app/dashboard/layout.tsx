export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white p-4">
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <nav className="mt-4">
            <ul>
              <li><a href="/dashboard" className="block p-2">Home</a></li>
              {/* <li><a href="/dashboard/schoolList" className="block p-2">Schools</a></li> */}
              {/* <li><a href="/dashboard/schoolList" className="block p-2">People</a></li> */}
              {/* <li><a href="/dashboard/lookForList" className="block p-2">Look Fors Bank</a></li> */}
              <li><a href="/dashboard/im-routines" className="block p-2">IM Routines</a></li>
            </ul>
          </nav>
        </aside>
  
        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-100">
          {children}
        </main>
      </div>
    );
  }