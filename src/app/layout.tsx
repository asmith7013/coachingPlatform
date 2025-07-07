import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import SentryBoundaryWrapper from "@components/error/SentryBoundaryWrapper";
import { QueryProvider } from "@query/core/provider";
import "@/app/globals.css";
import { PerformanceMonitorProvider } from "@lib/dev/debugging/usePerformanceMonitoring";
import { ClerkProvider } from '@clerk/nextjs'
import { AuthProvider } from '@/providers/AuthProvider'
import { Toaster } from 'sonner';

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "AI Coaching Platform",
  description: "Your personal AI coaching platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${inter.className} h-full`}>
      <body className={`bg-seasalt text-gunmetal font-sans antialiased h-full`}>
        <ClerkProvider dynamic>
          <QueryProvider> 
            <AuthProvider>  
              <SentryBoundaryWrapper>
                <PerformanceMonitorProvider>
                  {children}
                </PerformanceMonitorProvider>
              </SentryBoundaryWrapper>
            </AuthProvider>
          </QueryProvider>
        </ClerkProvider>
        <Toaster 
          position="top-right"
          richColors
          closeButton
          duration={4000}
          expand={false}
          gap={8}
        />
      </body>
    </html>
  );
}