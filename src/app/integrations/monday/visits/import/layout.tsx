"use client";

/**
 * Monday Visits Import Layout
 *
 * Sets up the providers and layout for the Monday.com visits import flow.
 */
import MondayLayout from "@/layouts/MondayLayout";
import { Heading } from "@/components/core/typography/Heading";

interface MondayVisitsImportLayoutProps {
  children: React.ReactNode;
}

export default function MondayVisitsImportLayout({
  children,
}: MondayVisitsImportLayoutProps) {
  return (
    <MondayLayout>
      <div className="container mx-auto py-6">
        <Heading level="h1" className="mb-6">
          Import Visits from Monday.com
        </Heading>

        <div className="bg-white rounded-lg shadow p-6">{children}</div>
      </div>
    </MondayLayout>
  );
}
