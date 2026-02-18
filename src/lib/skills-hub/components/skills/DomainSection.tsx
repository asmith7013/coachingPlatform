"use client";

import {
  Card,
  Text,
  Badge,
  Group,
  Accordion,
  Stack,
  SimpleGrid,
  Box,
} from "@mantine/core";
import { SkillCard } from "./SkillCard";
import { groupSkillsByLevel } from "../../core/taxonomy";
import { isSkillLocked } from "../../core/skill-lock";
import { SkillStatusEnum } from "../../core/skill-status.types";
import type {
  TeacherSkillDomain,
  TeacherSkillSubDomain,
  TeacherSkill,
  TeacherSkillFlat,
} from "../../core/taxonomy.types";
import type { TeacherSkillStatusDocument } from "../../core/skill-status.types";

interface DomainSectionProps {
  domain: TeacherSkillDomain;
  statusMap: Map<string, TeacherSkillStatusDocument>;
  teacherStaffId: string;
  isCoachView: boolean;
  onStatusChanged: () => void;
}

function enrichSkill(
  skill: TeacherSkill,
  domain: TeacherSkillDomain,
  subDomain: TeacherSkillSubDomain,
): TeacherSkillFlat {
  return {
    ...skill,
    domainUuid: domain.uuid,
    domainId: domain.id,
    domainName: domain.name,
    subDomainUuid: subDomain.uuid,
    subDomainId: subDomain.id,
    subDomainName: subDomain.name,
  };
}

function getSkillStatus(statusDoc: TeacherSkillStatusDocument | undefined) {
  const parsed = SkillStatusEnum.safeParse(statusDoc?.status);
  return parsed.success ? parsed.data : ("not_started" as const);
}

export function DomainSection({
  domain,
  statusMap,
  teacherStaffId,
  isCoachView,
  onStatusChanged,
}: DomainSectionProps) {
  const allSkills: TeacherSkillFlat[] = domain.subDomains.flatMap((sd) =>
    sd.skills.map((s) => enrichSkill(s, domain, sd)),
  );

  const activeCount = allSkills.filter(
    (s) => statusMap.get(s.uuid)?.status === "active",
  ).length;

  return (
    <Card shadow="sm" withBorder>
      <Card.Section withBorder inheritPadding py="sm">
        <Group justify="space-between">
          <Text fw={700} size="lg">
            {domain.name}
          </Text>
          {activeCount > 0 && (
            <Badge color="blue" variant="light">
              {activeCount} active
            </Badge>
          )}
        </Group>
      </Card.Section>

      <Accordion variant="separated" mt="sm">
        {domain.subDomains.map((subDomain) => {
          const { l1Skills, l2Skills: sdL2Skills } = groupSkillsByLevel(
            subDomain.skills,
          );
          const hasL2 = sdL2Skills.length > 0;

          return (
            <Accordion.Item key={subDomain.id} value={subDomain.id}>
              <Accordion.Control>
                <Text size="sm" fw={500}>
                  {subDomain.name}
                </Text>
              </Accordion.Control>
              <Accordion.Panel>
                <SimpleGrid cols={hasL2 ? { base: 1, sm: 2 } : 1} spacing="md">
                  <Box>
                    <Text
                      size="xs"
                      fw={600}
                      c="blue.7"
                      tt="uppercase"
                      mb="xs"
                      px="sm"
                    >
                      Level 1
                    </Text>
                    <Stack gap={2}>
                      {l1Skills.map((skill) => (
                        <SkillCard
                          key={skill.id}
                          skill={enrichSkill(skill, domain, subDomain)}
                          status={getSkillStatus(statusMap.get(skill.uuid))}
                          isLocked={false}
                          teacherStaffId={teacherStaffId}
                          isCoachView={isCoachView}
                          onStatusChanged={onStatusChanged}
                        />
                      ))}
                    </Stack>
                  </Box>

                  {hasL2 && (
                    <Box>
                      <Text
                        size="xs"
                        fw={600}
                        c="violet.7"
                        tt="uppercase"
                        mb="xs"
                        px="sm"
                      >
                        Level 2
                      </Text>
                      <Stack gap={2}>
                        {sdL2Skills.map((skill) => (
                          <SkillCard
                            key={skill.id}
                            skill={enrichSkill(skill, domain, subDomain)}
                            status={getSkillStatus(statusMap.get(skill.uuid))}
                            isLocked={isSkillLocked(
                              skill,
                              statusMap,
                              subDomain.skills,
                            )}
                            teacherStaffId={teacherStaffId}
                            isCoachView={isCoachView}
                            onStatusChanged={onStatusChanged}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </SimpleGrid>
              </Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </Card>
  );
}
