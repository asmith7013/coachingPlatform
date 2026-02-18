"use client";

import { useParams } from "next/navigation";
import { Title, Text, Card } from "@mantine/core";
import { ObservationGuide } from "../../../_components/ObservationGuide";

export default function ObservePage() {
  const params = useParams();
  const teacherId = params.teacherId as string;

  return (
    <div className="mx-auto" style={{ maxWidth: "1000px" }}>
      <Card shadow="sm" p="lg" mb="lg">
        <Title order={2}>Observation Guide</Title>
        <Text size="sm" c="dimmed">
          Rate skills and record evidence during this observation
        </Text>
      </Card>

      <ObservationGuide teacherStaffId={teacherId} />
    </div>
  );
}
