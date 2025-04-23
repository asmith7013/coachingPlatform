import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SentryBoundaryWrapper from "@/components/utility/SentryBoundaryWrapper";
import { SWRProvider } from "@/providers/SWRProvider";
import "@/app/globals.css";
import { PerformanceMonitorProvider } from "@/lib/dev/debugging/usePerformanceMonitoring";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Solves Coaching",
  description: "",
  // icons: {
  //   icon: "/favicon.ico",
  //   shortcut: "/favicon.ico",
  //   apple: "/favicon.ico",
  // },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className={`bg-seasalt text-gunmetal font-sans antialiased`}>
        <SentryBoundaryWrapper>
          <PerformanceMonitorProvider>
            <SWRProvider>{children}</SWRProvider>
          </PerformanceMonitorProvider>
        </SentryBoundaryWrapper>
      </body>
    </html>
  );
}
