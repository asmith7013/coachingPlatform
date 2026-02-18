import { Metadata } from "next";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { SCMNav } from "./SCMNav";
import { PublicSCMNav } from "./PublicSCMNav";

export const metadata: Metadata = {
  title: "SCM",
};

const ALLOWED_DOMAINS = [
  "schools.nyc.gov",
  "teachinglab.org",
  "teachinglabstudio.com",
];

const ALLOWED_NYC_EMAILS = [
  "ADurant@schools.nyc.gov",
  "YSanchez27@schools.nyc.gov",
  "knewman7@schools.nyc.gov",
  "JDeLancer3@schools.nyc.gov",
  "pcompres@schools.nyc.gov",
  "ccardona@schools.nyc.gov",
  "hviery@schools.nyc.gov",
  "EMorales5@schools.nyc.gov",
  "eburnside@schools.nyc.gov",
  "YDurant@schools.nyc.gov",
  "mmalunga@schools.nyc.gov",
  "NMcandrewesteve@schools.nyc.gov",
  "codonnell11@schools.nyc.gov",
  "dcolosimo@schools.nyc.gov",
  "AKatechis@schools.nyc.gov",
  "CMccarthy@schools.nyc.gov",
  "asmith7013@gmail.com",
  "kmcnickle@gmail.com",
  "mrscardonagarcia@gmail.com",
  "pcompres10@gmail.com",
  "mmalunga2002@gmail.com",
  "johnnydelancer@gmail.com",
];

function isAllowedDomain(email: string | null | undefined): boolean {
  if (!email) return false;

  const domain = email.split("@")[1];
  return ALLOWED_DOMAINS.includes(domain);
}

function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;

  // Check if email is in the specific allowlist
  if (ALLOWED_NYC_EMAILS.includes(email)) return true;

  // Otherwise check domain
  return isAllowedDomain(email);
}

export default async function SCMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const authResult = await getAuthenticatedUser();

  // If not authenticated, render public layout with minimal nav
  // Middleware handles protecting non-public routes, so if we get here
  // without auth, it means middleware allowed it (public route)
  if (!authResult.success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicSCMNav />
        <div className="p-6">{children}</div>
      </div>
    );
  }

  const { email } = authResult.data;

  // Check if user's email is allowed (specific email or domain)
  if (!isAllowedEmail(email)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-600 text-5xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            Access to SCM is restricted to authorized email domains only.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Allowed domains: {ALLOWED_DOMAINS.map((d) => `@${d}`).join(", ")}
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Your email: <strong>{email || "Unknown"}</strong>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <SCMNav />
      <div className="p-6">{children}</div>
    </div>
  );
}
