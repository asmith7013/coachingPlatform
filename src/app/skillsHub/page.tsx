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
  IconClipboardCheck,
  IconUsers,
  IconSettings,
  IconChevronRight,
} from "@tabler/icons-react";
import { useAuthenticatedUser } from "@/hooks/auth/useAuthenticatedUser";

type HubCard = {
  title: string;
  description: string;
  icon: React.ReactNode;
  links: { href: string; label: string }[];
  adminOnly?: boolean;
};

export default function SkillsHubPage() {
  const { hasRole, metadata } = useAuthenticatedUser();

  const isSuperAdmin = hasRole("super_admin");
  const isDirector = hasRole("director");
  const isAdmin = isSuperAdmin || isDirector;
  const isTeacher = !isAdmin && !hasRole("coach");

  const cards: HubCard[] = [
    {
      title: "My Caseload",
      description: "View and manage your assigned teachers",
      icon: <IconUsers size={24} />,
      links: [{ href: "/skillsHub/caseload", label: "View Caseload" }],
    },
    {
      title: "Skill Maps",
      description: "View teacher skill progression across all domains",
      icon: <IconMap size={24} />,
      links: [
        ...(isTeacher && metadata.staffId
          ? [
              {
                href: `/skillsHub/teacher/${metadata.staffId}`,
                label: "My Skills",
              },
            ]
          : [
              {
                href: "/skillsHub/caseload",
                label: "Select Teacher",
              },
            ]),
      ],
    },
    {
      title: "Observations",
      description: "Record and review classroom observations",
      icon: <IconClipboardCheck size={24} />,
      links: [
        ...(isTeacher
          ? []
          : [
              {
                href: "/skillsHub/caseload",
                label: "Select Teacher",
              },
            ]),
      ],
    },
    {
      title: "Admin",
      description: "Manage coach-teacher assignments",
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

  const visibleCards = cards.filter((c) => !c.adminOnly || isAdmin);

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
