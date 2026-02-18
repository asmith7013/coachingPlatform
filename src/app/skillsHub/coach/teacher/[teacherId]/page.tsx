"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Group, Title, Button, Text, Card } from "@mantine/core";
import { IconClipboardPlus, IconEye } from "@tabler/icons-react";
import { useAuthenticatedUser } from "@/hooks/auth/useAuthenticatedUser";
import { SkillMap } from "@/lib/skills-hub/components/skills/SkillMap";

export default function TeacherSkillMapPage() {
  const params = useParams();
  const teacherId = params.teacherId as string;
  const { hasRole } = useAuthenticatedUser();

  const isCoach =
    hasRole("coach") || hasRole("super_admin") || hasRole("director");

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

          {isCoach && (
            <Group>
              <Button
                component={Link}
                href={`/skillsHub/teacher/${teacherId}/action-plans/new`}
                leftSection={<IconClipboardPlus size={16} />}
                variant="light"
                size="sm"
              >
                Action Plan
              </Button>
              <Button
                component={Link}
                href={`/skillsHub/teacher/${teacherId}/observe`}
                leftSection={<IconEye size={16} />}
                size="sm"
              >
                Observe
              </Button>
            </Group>
          )}
        </Group>
      </Card>

      <SkillMap teacherStaffId={teacherId} isCoachView={isCoach} />
    </div>
  );
}
