"use client";

import { useState } from "react";
import { Title, Text, Card } from "@mantine/core";
import { CoachTeacherSelector } from "../_components/CoachTeacherSelector";
import { ObservationGuide } from "../_components/ObservationGuide";

export default function ObservationsPage() {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
    null,
  );

  return (
    <div className="mx-auto" style={{ maxWidth: "1600px" }}>
      <Card shadow="sm" p="lg" mb="lg">
        <Title order={2}>Observations</Title>
        <Text size="sm" c="dimmed">
          Record classroom observations using the coaching guide
        </Text>
      </Card>

      <CoachTeacherSelector
        selectedTeacherId={selectedTeacherId}
        onTeacherChange={setSelectedTeacherId}
      />

      {selectedTeacherId ? (
        <ObservationGuide teacherStaffId={selectedTeacherId} />
      ) : (
        <Card shadow="sm" p="lg">
          <Text c="dimmed" ta="center" py="xl">
            Select a teacher to begin an observation
          </Text>
        </Card>
      )}
    </div>
  );
}
