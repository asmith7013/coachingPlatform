"use client";

import { Accordion, Badge, Group, SimpleGrid, Text, Box } from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons-react";
import { SkillPairCard } from "./SkillPairCard";
import { SkillSoloCard } from "./SkillSoloCard";
import { isSkillLocked } from "../../core/skill-lock";
import { SkillStatusEnum } from "../../core/skill-status.types";
import type {
  TeacherSkill,
  TeacherSkillDomain,
  TeacherSkillSubDomain,
} from "../../core/taxonomy.types";
import type { TeacherSkillStatusDocument } from "../../core/skill-status.types";

interface DomainAccordionProps {
  domains: TeacherSkillDomain[];
  statusMap: Map<string, TeacherSkillStatusDocument>;
  defaultExpandedSubDomainsByDomain: Map<string, string[]>;
  onSkillClick?: (skillId: string) => void;
}

type SkillItem =
  | { type: "pair"; l1: TeacherSkill; l2: TeacherSkill }
  | { type: "solo"; skill: TeacherSkill };

function getStatus(
  statusMap: Map<string, TeacherSkillStatusDocument>,
  skillUuid: string,
) {
  const parsed = SkillStatusEnum.safeParse(statusMap.get(skillUuid)?.status);
  return parsed.success ? parsed.data : ("not_started" as const);
}

/**
 * Groups skills into pairs (L1+L2 linked by pairedSkillId) and solo skills.
 */
function groupSkillsIntoPairsAndSolos(skills: TeacherSkill[]): SkillItem[] {
  const items: SkillItem[] = [];
  const paired = new Set<string>();

  const skillByUuid = new Map(skills.map((s) => [s.uuid, s]));
  const l1Skills = skills.filter((s) => s.level === 1);

  for (const l1 of l1Skills) {
    if (!l1.pairedSkillId) continue;
    const l2 = skillByUuid.get(l1.pairedSkillId);
    if (l2 && l2.level === 2) {
      items.push({ type: "pair", l1, l2 });
      paired.add(l1.uuid);
      paired.add(l2.uuid);
    }
  }

  for (const skill of skills) {
    if (!paired.has(skill.uuid)) {
      items.push({ type: "solo", skill });
    }
  }

  return items;
}

function SubDomainSkills({
  subDomain,
  statusMap,
  onSkillClick,
}: {
  subDomain: TeacherSkillSubDomain;
  statusMap: Map<string, TeacherSkillStatusDocument>;
  onSkillClick?: (skillId: string) => void;
}) {
  const items = groupSkillsIntoPairsAndSolos(subDomain.skills);

  return (
    <SimpleGrid cols={2} spacing="sm">
      {items.map((item) => {
        if (item.type === "pair") {
          return (
            <Box
              key={`${item.l1.uuid}-${item.l2.uuid}`}
              style={{ gridColumn: "span 2" }}
            >
              <SkillPairCard
                l1={{
                  skillId: item.l1.id,
                  skillName: item.l1.name,
                  description: item.l1.description,
                  status: getStatus(statusMap, item.l1.uuid),
                  isLocked: false,
                  level: 1,
                }}
                l2={{
                  skillId: item.l2.id,
                  skillName: item.l2.name,
                  description: item.l2.description,
                  status: getStatus(statusMap, item.l2.uuid),
                  isLocked: isSkillLocked(item.l2, statusMap, subDomain.skills),
                  level: 2,
                }}
                onSkillClick={onSkillClick}
              />
            </Box>
          );
        }

        return (
          <Box
            key={item.skill.uuid}
            style={{
              gridColumn: item.skill.level === 1 ? 1 : 2,
            }}
          >
            <SkillSoloCard
              skillId={item.skill.id}
              skillName={item.skill.name}
              description={item.skill.description}
              level={item.skill.level as 1 | 2}
              status={getStatus(statusMap, item.skill.uuid)}
              isLocked={isSkillLocked(item.skill, statusMap, subDomain.skills)}
              onSkillClick={onSkillClick}
            />
          </Box>
        );
      })}
    </SimpleGrid>
  );
}

function DomainHeader({
  domain,
  domainIndex,
  statusMap,
}: {
  domain: TeacherSkillDomain;
  domainIndex: number;
  statusMap: Map<string, TeacherSkillStatusDocument>;
}) {
  const allSkills = domain.subDomains.flatMap((sd) => sd.skills);
  const totalSkills = allSkills.length;
  const proficientCount = allSkills.filter(
    (s) => getStatus(statusMap, s.uuid) === "proficient",
  ).length;
  const hasActive = allSkills.some((s) => {
    const st = getStatus(statusMap, s.uuid);
    return st === "active" || st === "developing";
  });
  const allComplete = totalSkills > 0 && proficientCount === totalSkills;

  return (
    <Group justify="space-between" wrap="nowrap" style={{ flex: 1 }}>
      <Group gap="sm" wrap="nowrap">
        <Box
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundColor: allComplete
              ? "var(--mantine-color-teal-6)"
              : "var(--mantine-color-gray-2)",
            color: allComplete ? "white" : "var(--mantine-color-dark-4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          {domainIndex + 1}
        </Box>
        <div>
          <Text fw={600}>{domain.name}</Text>
          <Text size="xs" c="dimmed">
            {proficientCount} of {totalSkills} skills completed
          </Text>
        </div>
      </Group>
      <Group gap="xs">
        {allComplete && (
          <IconCircleCheck size={20} color="var(--mantine-color-teal-6)" />
        )}
        {hasActive && !allComplete && (
          <Badge size="sm" variant="light" color="teal">
            In Progress
          </Badge>
        )}
      </Group>
    </Group>
  );
}

export function DomainAccordion({
  domains,
  statusMap,
  defaultExpandedSubDomainsByDomain,
  onSkillClick,
}: DomainAccordionProps) {
  // Domains with active/developing skills are expanded by default
  const defaultExpandedDomains = domains
    .filter((d) => defaultExpandedSubDomainsByDomain.has(d.id))
    .map((d) => d.id);

  return (
    <Accordion
      multiple
      defaultValue={defaultExpandedDomains}
      variant="separated"
    >
      {domains.map((domain, index) => {
        const totalSkills = domain.subDomains.flatMap((sd) => sd.skills).length;
        if (totalSkills === 0) return null;

        const expandedSubDomains =
          defaultExpandedSubDomainsByDomain.get(domain.id) ?? [];

        return (
          <Accordion.Item
            key={domain.id}
            value={domain.id}
            style={{
              backgroundColor: "var(--mantine-color-white)",
            }}
          >
            <Accordion.Control>
              <DomainHeader
                domain={domain}
                domainIndex={index}
                statusMap={statusMap}
              />
            </Accordion.Control>
            <Accordion.Panel>
              <Accordion
                multiple
                defaultValue={expandedSubDomains}
                variant="separated"
              >
                {domain.subDomains.map((subDomain) => (
                  <Accordion.Item key={subDomain.id} value={subDomain.id}>
                    <Accordion.Control>
                      <Text size="sm" fw={500}>
                        {subDomain.name}
                      </Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <SubDomainSkills
                        subDomain={subDomain}
                        statusMap={statusMap}
                        onSkillClick={onSkillClick}
                      />
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Accordion.Panel>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
}
