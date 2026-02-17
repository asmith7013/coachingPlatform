"use client";

import React from "react";
import { Card } from "@/components/composed/cards/Card";
import { CoachingActionPlanDashboard } from "@/components/features/coaching/CAPDashboard";

interface MetricsCardProps {
  onExportData?: () => void;
  onViewReport?: () => void;
  metrics?: {
    totalSubscribers: string;
    avgOpenRate: string;
    avgClickRate: string;
  };
}

export function CAPCard({}: MetricsCardProps) {
  return (
    <Card padding="lg" radius="lg">
      <CoachingActionPlanDashboard />
    </Card>
  );
}
