"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Title, Text, Card, Group, Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useSkillProgressions } from "@/lib/skills-hub/hooks/useSkillProgressions";
import { SkillProgressionList } from "@/lib/skills-hub/components/skill-progressions/SkillProgressionList";

export default function SkillProgressionsPage() {
  const params = useParams();
  const teacherId = params.teacherId as string;
  const { plans, loading, error } = useSkillProgressions(teacherId);

  return (
    <div className="mx-auto" style={{ maxWidth: "1200px" }}>
      <Card shadow="sm" p="lg" mb="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>Skill Progressions</Title>
            <Text size="sm" c="dimmed">
              Coaching skill progressions and steps
            </Text>
          </div>
          <Button
            component={Link}
            href={`/skillsHub/coach/teacher/${teacherId}/skill-progressions/new`}
            leftSection={<IconPlus size={16} />}
          >
            New Plan
          </Button>
        </Group>
      </Card>

      {error ? (
        <Text c="red">{error}</Text>
      ) : (
        <SkillProgressionList
          plans={plans}
          loading={loading}
          teacherStaffId={teacherId}
        />
      )}
    </div>
  );
}
