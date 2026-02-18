"use client";

import Link from "next/link";
import {
  SimpleGrid,
  Card,
  Text,
  Group,
  ThemeIcon,
  Stack,
  Anchor,
  Title,
} from "@mantine/core";
import {
  IconMap,
  IconUsers,
  IconSettings,
  IconList,
  IconChevronRight,
} from "@tabler/icons-react";
import { useAuthenticatedUser } from "@/hooks/auth/useAuthenticatedUser";

type HubCard = {
  title: string;
  description: string;
  icon: React.ReactNode;
  links: { href: string; label: string }[];
  adminOnly?: boolean;
  coachOnly?: boolean;
  teacherOnly?: boolean;
};

export default function SkillsHubPage() {
  const { hasRole, metadata } = useAuthenticatedUser();

  const isSuperAdmin = hasRole("super_admin");
  const isDirector = hasRole("director");
  const isAdmin = isSuperAdmin || isDirector;
  const isCoach = hasRole("coach");
  const isTeacher = !isAdmin && !isCoach;

  const cards: HubCard[] = [
    {
      title: "Caseload",
      description:
        "View assigned teachers, observe, and create action plans",
      icon: <IconUsers size={24} />,
      links: [{ href: "/skillsHub/caseload", label: "View Caseload" }],
      coachOnly: true,
    },
    {
      title: "My Skill Map",
      description: "View your skill progression and coaching feedback",
      icon: <IconMap size={24} />,
      links: metadata.staffId
        ? [
            {
              href: `/skillsHub/teacher/${metadata.staffId}`,
              label: "View My Skills",
            },
          ]
        : [],
      teacherOnly: true,
    },
    {
      title: "All Skills",
      description: "Browse the full teacher skills taxonomy",
      icon: <IconList size={24} />,
      links: [{ href: "/skillsHub/skills", label: "View All Skills" }],
    },
    {
      title: "Assignments",
      description: "Manage coach-teacher pairings",
      icon: <IconSettings size={24} />,
      links: [
        {
          href: "/skillsHub/admin/assignments",
          label: "Manage Assignments",
        },
      ],
      adminOnly: true,
    },
  ];

  const visibleCards = cards.filter((c) => {
    if (c.adminOnly && !isAdmin) return false;
    if (c.coachOnly && isTeacher) return false;
    if (c.teacherOnly && !isTeacher) return false;
    return true;
  });

  return (
    <div className="mx-auto" style={{ maxWidth: "1600px" }}>
      <Card shadow="sm" p="xl" mb="lg">
        <Title order={1} mb={4}>
          Skills Hub
        </Title>
        <Text c="dimmed">
          {isTeacher
            ? "View your skill progression and coaching feedback"
            : "Manage teacher skill development, action plans, and observations"}
        </Text>
      </Card>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {visibleCards.map((card) => (
          <Card key={card.title} shadow="sm" padding="lg" withBorder>
            <Group mb="sm">
              <ThemeIcon size="lg" radius="md" variant="light">
                {card.icon}
              </ThemeIcon>
              <div>
                <Text fw={700} size="lg">
                  {card.title}
                </Text>
                <Text size="sm" c="dimmed">
                  {card.description}
                </Text>
              </div>
            </Group>

            {card.links.length > 0 && (
              <Stack gap="xs" mt="md">
                {card.links.map((link) => (
                  <Anchor
                    key={link.href}
                    component={Link}
                    href={link.href}
                    size="sm"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {link.label}
                    <IconChevronRight size={14} />
                  </Anchor>
                ))}
              </Stack>
            )}
          </Card>
        ))}
      </SimpleGrid>
    </div>
  );
}
