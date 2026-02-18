"use client";

import {
  Card,
  Text,
  Badge,
  Group,
  Accordion,
  Stack,
  Button,
  SimpleGrid,
  Box,
} from "@mantine/core";
import { SkillCard } from "./SkillCard";
import { groupSkillsByLevel } from "../_lib/taxonomy";
import type {
  TeacherSkillDomain,
  TeacherSkillFlat,
} from "../_types/taxonomy.types";
import type { TeacherSkillStatusDocument } from "../_types/skill-status.types";
import type { SkillStatus } from "../_types/skill-status.types";

interface DomainSectionProps {
  domain: TeacherSkillDomain;
  statusMap: Map<string, TeacherSkillStatusDocument>;
  teacherStaffId: string;
  isCoachView: boolean;
  onStatusChanged: () => void;
  onUnlockLevel2: (skillIds: string[]) => void;
}

export function DomainSection({
  domain,
  statusMap,
  teacherStaffId,
  isCoachView,
  onStatusChanged,
  onUnlockLevel2,
}: DomainSectionProps) {
  const allSkills: TeacherSkillFlat[] = domain.subDomains.flatMap((sd) =>
    sd.skills.map((s) => ({
      ...s,
      domainUuid: domain.uuid,
      domainId: domain.id,
      domainName: domain.name,
      subDomainUuid: sd.uuid,
      subDomainId: sd.id,
      subDomainName: sd.name,
    })),
  );

  const activeCount = allSkills.filter(
    (s) => statusMap.get(s.uuid)?.status === "active",
  ).length;

  const level2Skills = allSkills.filter((s) => s.level === 2);
  const hasLevel2 = level2Skills.length > 0;
  const level2Unlocked = level2Skills.some(
    (s) => statusMap.get(s.uuid)?.level2Unlocked,
  );

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
                      {l1Skills.map((skill) => {
                        const statusDoc = statusMap.get(skill.uuid);
                        return (
                          <SkillCard
                            key={skill.id}
                            skill={{
                              ...skill,
                              domainUuid: domain.uuid,
                              domainId: domain.id,
                              domainName: domain.name,
                              subDomainUuid: subDomain.uuid,
                              subDomainId: subDomain.id,
                              subDomainName: subDomain.name,
                            }}
                            status={
                              (statusDoc?.status as SkillStatus) ||
                              "not_started"
                            }
                            level2Unlocked={true}
                            teacherStaffId={teacherStaffId}
                            isCoachView={isCoachView}
                            onStatusChanged={onStatusChanged}
                          />
                        );
                      })}
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
                        {sdL2Skills.map((skill) => {
                          const statusDoc = statusMap.get(skill.uuid);
                          return (
                            <SkillCard
                              key={skill.id}
                              skill={{
                                ...skill,
                                domainUuid: domain.uuid,
                                domainId: domain.id,
                                domainName: domain.name,
                                subDomainUuid: subDomain.uuid,
                                subDomainId: subDomain.id,
                                subDomainName: subDomain.name,
                              }}
                              status={
                                (statusDoc?.status as SkillStatus) ||
                                "not_started"
                              }
                              level2Unlocked={
                                statusDoc?.level2Unlocked || level2Unlocked
                              }
                              teacherStaffId={teacherStaffId}
                              isCoachView={isCoachView}
                              onStatusChanged={onStatusChanged}
                            />
                          );
                        })}
                      </Stack>
                    </Box>
                  )}
                </SimpleGrid>
              </Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion>

      {hasLevel2 && !level2Unlocked && isCoachView && (
        <Button
          variant="light"
          color="violet"
          size="xs"
          mt="sm"
          onClick={() => onUnlockLevel2(level2Skills.map((s) => s.uuid))}
        >
          Unlock Level 2 Skills
        </Button>
      )}
    </Card>
  );
}
