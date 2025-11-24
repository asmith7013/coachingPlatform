import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Roadmaps',
};

const ALLOWED_DOMAINS = ['schools.nyc.gov', 'teachinglab.org', 'teachinglabstudio.com'];

function isAllowedDomain(email: string | null | undefined): boolean {
  if (!email) return false;

  const domain = email.split('@')[1];
  return ALLOWED_DOMAINS.includes(domain);
}

export default async function RoadmapsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Skip authentication in development (localhost)
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    return <>{children}</>;
  }

  // Production: Enforce authentication and domain restrictions
  const { userId } = await auth();

  // Require authentication - redirect to sign-in if not logged in
  if (!userId) {
    const currentPath = '/roadmaps';
    redirect(`/sign-in?redirect_url=${encodeURIComponent(currentPath)}`);
  }

  // Get full user object to access email addresses
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  // Check if user's email domain is allowed
  if (!isAllowedDomain(email)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-600 text-5xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            Access to Roadmaps is restricted to authorized email domains only.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Allowed domains: {ALLOWED_DOMAINS.map(d => `@${d}`).join(', ')}
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Your email: <strong>{email || 'Unknown'}</strong>
          </p>
          <a
            href="/sign-out"
            className="inline-block px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Sign Out
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
