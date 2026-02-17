/**
 * Auth layout - no ClerkProvider needed here
 * (ClerkProvider is already in root layout)
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
