import React from "react";
// import { TodaysVisitDashboard } from '@/components/features/todaysVisitDashboard/TodaysVisitDashboard';
import { Heading } from "@/components/core/typography/Heading";
import { Text } from "@/components/core/typography/Text";

export default function TodaysVisitDashboardExample() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Page Header */}
      <div className="space-y-4">
        <Heading level="h1" color="default">
          Today&apos;s Visit Dashboard
        </Heading>
        <Text color="muted" className="max-w-2xl">
          A comprehensive dashboard showing today&apos;s coaching visit
          information using the new embedded documents architecture. This
          dashboard efficiently displays visit details, coaching focus areas,
          metrics to measure, and schedule information all from a single data
          source.
        </Text>
      </div>

      {/* Dashboard - Temporarily disabled due to build issues */}
      <div className="p-8 border border-gray-200 rounded-lg bg-gray-50">
        <Text color="muted">
          Dashboard temporarily disabled due to build issues. Will be re-enabled
          after fixing React Context problems.
        </Text>
      </div>
      {/* <TodaysVisitDashboard /> */}

      {/* Implementation Notes */}
      <div className="border-t pt-8 space-y-4">
        <Heading level="h2" color="default">
          Implementation Features
        </Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Heading level="h3" color="default" className="text-lg">
              Embedded Documents Architecture
            </Heading>
            <Text textSize="sm" color="muted">
              • Weekly plans embedded in action plans
              <br />
              • Metrics embedded in outcomes
              <br />
              • Single data fetch for all coaching data
              <br />• Direct array indexing for performance
            </Text>
          </div>

          <div className="space-y-2">
            <Heading level="h3" color="default" className="text-lg">
              Smart Data Relationships
            </Heading>
            <Text textSize="sm" color="muted">
              • Visit references weekly plan by index
              <br />
              • Focus outcomes by index array
              <br />
              • Automatic data derivation
              <br />• Optimized React Query caching
            </Text>
          </div>

          <div className="space-y-2">
            <Heading level="h3" color="default" className="text-lg">
              Performance Optimizations
            </Heading>
            <Text textSize="sm" color="muted">
              • Selective context hooks
              <br />
              • Minimal re-renders
              <br />
              • Efficient data transformations
              <br />• Responsive loading states
            </Text>
          </div>

          <div className="space-y-2">
            <Heading level="h3" color="default" className="text-lg">
              User Experience
            </Heading>
            <Text textSize="sm" color="muted">
              • Comprehensive visit overview
              <br />
              • Clear focus and goals display
              <br />
              • Detailed metrics tracking
              <br />• Schedule integration ready
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
