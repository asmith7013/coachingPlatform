"use client";

import { Accordion, Group, SimpleGrid, Text, Box } from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons-react";
import { SkillPairCard } from "./SkillPairCard";
import { SkillSoloCard } from "./SkillSoloCard";
import { getDomainIcon } from "../../core/domain-icons";
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
                  skillId: item.l1.uuid,
                  skillName: item.l1.name,
                  description: item.l1.description,
                  status: getStatus(statusMap, item.l1.uuid),
                  isLocked: false,
                  level: 1,
                }}
                l2={{
                  skillId: item.l2.uuid,
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
              skillId={item.skill.uuid}
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
  statusMap,
}: {
  domain: TeacherSkillDomain;
  statusMap: Map<string, TeacherSkillStatusDocument>;
}) {
  const allSkills = domain.subDomains.flatMap((sd) => sd.skills);
  const totalSkills = allSkills.length;
  const proficientCount = allSkills.filter(
    (s) => getStatus(statusMap, s.uuid) === "proficient",
  ).length;
  const activeCount = allSkills.filter(
    (s) => getStatus(statusMap, s.uuid) === "active",
  ).length;
  const allComplete = totalSkills > 0 && proficientCount === totalSkills;

  const circleBg = allComplete
    ? "var(--mantine-color-teal-6)"
    : activeCount > 0
      ? "var(--mantine-color-blue-5)"
      : "var(--mantine-color-gray-2)";
  const circleColor =
    allComplete || activeCount > 0 ? "white" : "var(--mantine-color-dark-4)";

  const DomainIcon = getDomainIcon(domain.name);

  return (
    <Group justify="space-between" wrap="nowrap" style={{ flex: 1 }}>
      <Group gap="sm" wrap="nowrap">
        <Box
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundColor: circleBg,
            color: circleColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {activeCount > 0 ? (
            activeCount
          ) : (
            <DomainIcon size={16} color={circleColor} />
          )}
        </Box>
        <div>
          <Text fw={600}>{domain.name}</Text>
          <Text size="xs" c="dimmed">
            {proficientCount} of {totalSkills} skills completed
          </Text>
        </div>
      </Group>
      {allComplete && (
        <IconCircleCheck size={20} color="var(--mantine-color-teal-6)" />
      )}
    </Group>
  );
}

export function DomainAccordion({
  domains,
  statusMap,
  defaultExpandedSubDomainsByDomain: _defaultExpandedSubDomainsByDomain,
  onSkillClick,
}: DomainAccordionProps) {
  return (
    <Accordion multiple defaultValue={[]} variant="separated">
      {domains.map((domain) => {
        const totalSkills = domain.subDomains.flatMap((sd) => sd.skills).length;
        if (totalSkills === 0) return null;

        return (
          <Accordion.Item
            key={domain.id}
            value={domain.id}
            style={{
              backgroundColor: "var(--mantine-color-white)",
            }}
          >
            <Accordion.Control>
              <DomainHeader domain={domain} statusMap={statusMap} />
            </Accordion.Control>
            <Accordion.Panel>
              <Accordion multiple defaultValue={[]} variant="separated">
                {domain.subDomains.map((subDomain) => {
                  const activeSkills = subDomain.skills.filter(
                    (s) => getStatus(statusMap, s.uuid) === "active",
                  );
                  return (
                    <Accordion.Item key={subDomain.id} value={subDomain.id}>
                      <Accordion.Control>
                        <Group gap="xs" wrap="nowrap">
                          <Text size="sm" fw={500}>
                            {subDomain.name}
                          </Text>
                          {activeSkills.length > 0 && (
                            <Box
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                backgroundColor: "var(--mantine-color-blue-5)",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {activeSkills.length}
                            </Box>
                          )}
                        </Group>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <SubDomainSkills
                          subDomain={subDomain}
                          statusMap={statusMap}
                          onSkillClick={onSkillClick}
                        />
                      </Accordion.Panel>
                    </Accordion.Item>
                  );
                })}
              </Accordion>
            </Accordion.Panel>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
}
