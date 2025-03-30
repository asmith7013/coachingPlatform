import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SentryBoundaryWrapper from "@/components/error-boundaries/SentryBoundaryWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
        // overscroll-none <-- this is a tailwind class that prevents the page from overscrolling
      >
        <SentryBoundaryWrapper>
        {children}
        </SentryBoundaryWrapper>
      </body>
    </html>
  );
}
