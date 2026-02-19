"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Group, Title, Button, Text, Card } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { SkillProgressionView } from "@/lib/skills-hub/components/skills/SkillProgressionView";

export default function TeacherSkillMapPage() {
  const params = useParams();
  const teacherId = params.teacherId as string;

  return (
    <div className="mx-auto" style={{ maxWidth: "1600px" }}>
      <Card shadow="sm" p="lg" mb="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>Skill Map</Title>
            <Text size="sm" c="dimmed">
              Teacher skill progression across all domains
            </Text>
          </div>

          <Group>
            <Button
              component={Link}
              href={`/skillsHub/coach/teacher/${teacherId}/observe`}
              leftSection={<IconEye size={16} />}
              size="sm"
            >
              Observe
            </Button>
          </Group>
        </Group>
      </Card>

      <SkillProgressionView teacherStaffId={teacherId} />
    </div>
  );
}
