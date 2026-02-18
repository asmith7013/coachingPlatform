"use client";

import { SimpleGrid, Card, Text, Title } from "@mantine/core";
import type { TeacherSkillsIndex } from "../../core/taxonomy.types";
import type { TeacherSkillStatusDocument } from "../../core/skill-status.types";

interface ProgressStatsRowProps {
  taxonomy: TeacherSkillsIndex;
  statusMap: Map<string, TeacherSkillStatusDocument>;
}

function computeStats(
  taxonomy: ProgressStatsRowProps["taxonomy"],
  statusMap: ProgressStatsRowProps["statusMap"],
) {
  let totalSkills = 0;
  let proficientCount = 0;
  let activeCount = 0;
  let domainsCompleted = 0;
  taxonomy.domains.forEach((domain) => {
    let domainTotal = 0;
    let domainProficient = 0;

    for (const subDomain of domain.subDomains) {
      for (const skill of subDomain.skills) {
        totalSkills++;
        domainTotal++;
        const status = statusMap.get(skill.uuid)?.status ?? "not_started";

        if (status === "proficient") {
          proficientCount++;
          domainProficient++;
        } else if (status === "active" || status === "developing") {
          activeCount++;
        }
      }
    }

    if (domainTotal > 0 && domainProficient === domainTotal) {
      domainsCompleted++;
    }
  });

  return {
    proficientCount,
    totalSkills,
    activeCount,
    domainsCompleted,
    totalDomains: taxonomy.domains.filter((d) => d.subDomains.length > 0)
      .length,
  };
}

export function ProgressStatsRow({
  taxonomy,
  statusMap,
}: ProgressStatsRowProps) {
  const stats = computeStats(taxonomy, statusMap);

  const cards = [
    {
      label: "Skills Mastered",
      value: `${stats.proficientCount} of ${stats.totalSkills}`,
    },
    { label: "Active Skills", value: `${stats.activeCount}` },
    {
      label: "Domains Completed",
      value: `${stats.domainsCompleted} of ${stats.totalDomains}`,
    },
  ];

  return (
    <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
      {cards.map((card) => (
        <Card key={card.label} shadow="sm" withBorder p="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
            {card.label}
          </Text>
          <Title order={3} mt={4}>
            {card.value}
          </Title>
        </Card>
      ))}
    </SimpleGrid>
  );
}
