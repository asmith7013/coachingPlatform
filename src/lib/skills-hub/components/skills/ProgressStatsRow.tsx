"use client";

import { SimpleGrid, Card, Text, Title, Stack } from "@mantine/core";
import { SkillSoloCard } from "./SkillSoloCard";
import type { TeacherSkillsIndex, TeacherSkill } from "../../core/taxonomy.types";
import type { TeacherSkillStatusDocument } from "../../core/skill-status.types";

interface ProgressStatsRowProps {
  taxonomy: TeacherSkillsIndex;
  statusMap: Map<string, TeacherSkillStatusDocument>;
  onSkillClick?: (skillId: string) => void;
}

interface ActiveSkillInfo {
  skill: TeacherSkill;
  domainName: string;
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
        } else if (status === "active") {
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

function collectActiveSkills(
  taxonomy: TeacherSkillsIndex,
  statusMap: Map<string, TeacherSkillStatusDocument>,
): ActiveSkillInfo[] {
  const active: ActiveSkillInfo[] = [];
  for (const domain of taxonomy.domains) {
    for (const subDomain of domain.subDomains) {
      for (const skill of subDomain.skills) {
        if (statusMap.get(skill.uuid)?.status === "active") {
          active.push({ skill, domainName: domain.name });
        }
      }
    }
  }
  return active;
}

export function ProgressStatsRow({
  taxonomy,
  statusMap,
  onSkillClick,
}: ProgressStatsRowProps) {
  const stats = computeStats(taxonomy, statusMap);
  const activeSkills = collectActiveSkills(taxonomy, statusMap);

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
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
        {cards.map((card) => (
          <Card key={card.label} withBorder p="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
              {card.label}
            </Text>
            <Title order={3} mt={4}>
              {card.value}
            </Title>
          </Card>
        ))}
      </SimpleGrid>

      {activeSkills.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {activeSkills.map(({ skill, domainName }) => (
            <SkillSoloCard
              key={skill.uuid}
              skillId={skill.uuid}
              skillName={skill.name}
              description={skill.description}
              level={skill.level}
              status="active"
              isLocked={false}
              domainName={domainName}
              onSkillClick={onSkillClick}
            />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
