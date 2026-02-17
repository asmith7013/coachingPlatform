import React from "react";
import { Card } from "@/components/composed/cards/Card";
import { Heading } from "@/components/core/typography/Heading";
import { Text } from "@/components/core/typography/Text";
import { Badge } from "@/components/core/feedback/Badge";
import { Visit } from "@zod-schema/visits/visit";
import { School } from "@zod-schema/core/school";
import { VisitStatusCard } from "./VisitStatusCard";

interface SchoolVisitsGroupProps {
  school: School;
  visits: Visit[];
}

export function SchoolVisitsGroup({ school, visits }: SchoolVisitsGroupProps) {
  const completeCount = visits.filter(
    (v) => v.coachingLogSubmitted === true,
  ).length;
  const incompleteCount = visits.filter(
    (v) => v.coachingLogSubmitted === false,
  ).length;

  return (
    <Card>
      <Card.Header className="border-b">
        <div className="flex justify-between items-center">
          <div>
            <Heading level="h3" className="text-xl font-semibold">
              {school.emoji || "🏫"} {school.schoolName}
            </Heading>
            <Text color="muted" className="mt-1">
              District: {school.district}
            </Text>
          </div>
          <div className="flex gap-2">
            <Badge intent="success" size="sm">
              {completeCount} Complete
            </Badge>
            <Badge intent="danger" size="sm">
              {incompleteCount} Pending
            </Badge>
          </div>
        </div>
      </Card.Header>

      <Card.Body>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visits
            .sort(
              (a, b) =>
                new Date(a.date || "").getTime() -
                new Date(b.date || "").getTime(),
            )
            .map((visit) => (
              <VisitStatusCard key={visit._id} visit={visit} />
            ))}
        </div>
      </Card.Body>
    </Card>
  );
}
