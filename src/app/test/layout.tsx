export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">
            Test Environment
          </h1>
          <p className="text-sm text-gray-600">
            Development testing for schema → server actions → hooks flow
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
