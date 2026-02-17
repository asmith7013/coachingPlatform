"use client";

import { Card } from "@composed-components/cards/Card";
import { TodaysVisitDashboard } from "@/components/features/todaysVisitDashboard/TodaysVisitDashboard";

interface TodaysVisitDashboardCardProps {
  schoolId: string;
  schoolName: string;
}

function TodaysVisitDashboardCard({ schoolId }: TodaysVisitDashboardCardProps) {
  return (
    <Card>
      <TodaysVisitDashboard schoolId={schoolId} />
    </Card>
  );
}

export default TodaysVisitDashboardCard;
