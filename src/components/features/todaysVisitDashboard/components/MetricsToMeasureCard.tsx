import React from "react";
import { Card } from "@/components/composed/cards/Card";
import { Heading } from "@/components/core/typography/Heading";
import { Text } from "@/components/core/typography/Text";
import { Badge } from "@/components/core/feedback/Badge";
import { ChartBarIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import { useTodaysVisitData } from "../context/TodaysVisitContext";

export function MetricsToMeasureCard() {
  const { todaysVisit, isLoading } = useTodaysVisitData();

  if (isLoading) {
    return (
      <Card padding="lg" className="animate-pulse">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!todaysVisit || !todaysVisit.metrics.length) {
    return (
      <Card padding="lg" className="text-center">
        <div className="space-y-4">
          <ChartBarIcon className="h-8 w-8 text-gray-400 mx-auto" />
          <Text color="muted">No metrics to measure</Text>
        </div>
      </Card>
    );
  }

  const { metrics } = todaysVisit;

  return (
    <Card padding="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <ChartBarIcon className="h-6 w-6 text-green-600" />
          <Heading level="h3" color="default">
            Metrics to Measure
          </Heading>
          <Badge intent="info" className="text-xs">
            {metrics.length}
          </Badge>
        </div>

        {/* Metrics List */}
        <div className="space-y-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="border rounded-lg p-4 space-y-3">
              {/* Metric Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <Text color="default" className="font-medium">
                    {metric.name}
                  </Text>
                  <Text textSize="sm" color="muted">
                    {metric.description}
                  </Text>
                </div>
                <Badge intent="secondary" className="text-xs">
                  {metric.type}
                </Badge>
              </div>

              {/* Collection Method */}
              <div className="flex items-center gap-2 text-sm">
                <Text textSize="sm" color="muted" className="font-medium">
                  Collection:
                </Text>
                <Text textSize="sm" color="default">
                  {metric.collectionMethod}
                </Text>
              </div>

              {/* Values */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="space-y-1">
                  <Text
                    textSize="xs"
                    color="muted"
                    className="font-medium uppercase tracking-wide"
                  >
                    Baseline
                  </Text>
                  <Text textSize="sm" color="default" className="font-mono">
                    {metric.baselineValue || "—"}
                  </Text>
                </div>

                <div className="space-y-1">
                  <Text
                    textSize="xs"
                    color="muted"
                    className="font-medium uppercase tracking-wide"
                  >
                    Target
                  </Text>
                  <div className="flex items-center gap-1">
                    <ArrowTrendingUpIcon className="h-3 w-3 text-green-600" />
                    <Text textSize="sm" color="default" className="font-mono">
                      {metric.targetValue}
                    </Text>
                  </div>
                </div>

                <div className="space-y-1">
                  <Text
                    textSize="xs"
                    color="muted"
                    className="font-medium uppercase tracking-wide"
                  >
                    Current
                  </Text>
                  <Text textSize="sm" color="default" className="font-mono">
                    {metric.currentValue || "—"}
                  </Text>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Monitoring Note */}
        {todaysVisit.weeklyPlan?.progressMonitoring && (
          <div className="border-t pt-4">
            <div className="space-y-2">
              <Text
                textSize="sm"
                color="muted"
                className="font-medium uppercase tracking-wide"
              >
                Progress Monitoring Plan
              </Text>
              <Text color="default" textSize="sm">
                {todaysVisit.weeklyPlan.progressMonitoring}
              </Text>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
