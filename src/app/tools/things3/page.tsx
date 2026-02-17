"use client";

import dynamic from "next/dynamic";

// Dynamically import the ThingsImporter to avoid server-side rendering issues
// with browser-specific features like navigator.clipboard
const ThingsImporter = dynamic(
  () => import("@/components/domain/things3/ThingsImporter"),
  { ssr: false },
);

export default function ThingsImporterPage() {
  return <ThingsImporter />;
}
