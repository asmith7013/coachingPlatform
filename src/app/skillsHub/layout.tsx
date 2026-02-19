import { Metadata } from "next";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { MantineShell } from "@/lib/skills-hub/components/layout/MantineShell";
import { SkillsHubNav } from "@/lib/skills-hub/components/layout/SkillsHubNav";
import { StatusLegendProvider } from "@/lib/skills-hub/components/core/StatusLegendContext";
import { StatusLegendFooter } from "@/lib/skills-hub/components/core/StatusLegendFooter";
import { DrawerPortalProvider } from "@/lib/skills-hub/components/core/DrawerPortalContext";
import { ViewAsProvider } from "@/lib/skills-hub/components/layout/ViewAsContext";

export const metadata: Metadata = {
  title: "Skills Hub",
};

const ALLOWED_DOMAINS = [
  "schools.nyc.gov",
  "teachinglab.org",
  "teachinglabstudio.com",
];

const ALLOWED_EMAILS = [
  "asmith7013@gmail.com",
  "kmcnickle@gmail.com",
  "mrscardonagarcia@gmail.com",
  "pcompres10@gmail.com",
  "mmalunga2002@gmail.com",
  "johnnydelancer@gmail.com",
];

function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;

  if (ALLOWED_EMAILS.includes(email)) return true;

  const domain = email.split("@")[1];
  return ALLOWED_DOMAINS.includes(domain);
}

export default async function SkillsHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authResult = await getAuthenticatedUser();

  // Not authenticated — render children without nav (sign-in page will render here)
  if (!authResult.success) {
    return <MantineShell>{children}</MantineShell>;
  }

  const { email } = authResult.data;

  if (!isAllowedEmail(email)) {
    return (
      <MantineShell>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-4">
              Access to Skills Hub is restricted to authorized users only.
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
      </MantineShell>
    );
  }

  return (
    <MantineShell>
      <ViewAsProvider>
        <StatusLegendProvider>
          <DrawerPortalProvider>
            <div className="min-h-screen bg-gray-50 pb-12">
              <SkillsHubNav />
              <div className="p-6">{children}</div>
              <StatusLegendFooter />
            </div>
          </DrawerPortalProvider>
        </StatusLegendProvider>
      </ViewAsProvider>
    </MantineShell>
  );
}
