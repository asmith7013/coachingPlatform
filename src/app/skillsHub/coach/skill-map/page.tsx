"use client";

import { useState, useCallback } from "react";
import { Title, Text, Card } from "@mantine/core";
import { useSkillsHubFilters } from "@/lib/skills-hub/hooks/useSkillsHubFilters";
import { CoachTeacherSelector } from "@/lib/skills-hub/components/core/CoachTeacherSelector";
import { SkillProgressionView } from "@/lib/skills-hub/components/skills/SkillProgressionView";

export default function SkillMapPage() {
  const { selectedTeacherId, setSelectedTeacherId } = useSkillsHubFilters();
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const handleTeacherNameChange = useCallback((name: string | null) => {
    setTeacherName(name);
  }, []);

  return (
    <div className="mx-auto" style={{ maxWidth: "1600px" }}>
      <Card shadow="sm" p="lg" mb="lg">
        <Title order={2}>Skill Map</Title>
        <Text size="sm" c="dimmed">
          Teacher skill progression across all domains
        </Text>
      </Card>

      <CoachTeacherSelector
        selectedTeacherId={selectedTeacherId}
        onTeacherChange={setSelectedTeacherId}
        onTeacherNameChange={handleTeacherNameChange}
      />

      {selectedTeacherId ? (
        <SkillProgressionView
          teacherStaffId={selectedTeacherId}
          teacherName={teacherName ?? undefined}
        />
      ) : (
        <Card shadow="sm" p="lg">
          <Text c="dimmed" ta="center" py="xl">
            Select a teacher to view their skill map
          </Text>
        </Card>
      )}
    </div>
  );
}
