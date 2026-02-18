"use client";

import {
  Card,
  Text,
  Badge,
  Group,
  Accordion,
  Stack,
  Button,
} from "@mantine/core";
import { SkillCard } from "./SkillCard";
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
      domainId: domain.id,
      domainName: domain.name,
      subDomainId: sd.id,
      subDomainName: sd.name,
    })),
  );

  const activeCount = allSkills.filter(
    (s) => statusMap.get(s.id)?.status === "active",
  ).length;

  const level2Skills = allSkills.filter((s) => s.level === 2);
  const hasLevel2 = level2Skills.length > 0;
  const level2Unlocked = level2Skills.some(
    (s) => statusMap.get(s.id)?.level2Unlocked,
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
          const level1Skills = subDomain.skills.filter((s) => s.level === 1);
          const sdLevel2Skills = subDomain.skills.filter((s) => s.level === 2);

          return (
            <Accordion.Item key={subDomain.id} value={subDomain.id}>
              <Accordion.Control>
                <Text size="sm" fw={500}>
                  {subDomain.name}
                </Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap={2}>
                  {level1Skills.map((skill) => {
                    const statusDoc = statusMap.get(skill.id);
                    return (
                      <SkillCard
                        key={skill.id}
                        skill={{
                          ...skill,
                          domainId: domain.id,
                          domainName: domain.name,
                          subDomainId: subDomain.id,
                          subDomainName: subDomain.name,
                        }}
                        status={
                          (statusDoc?.status as SkillStatus) || "not_started"
                        }
                        level2Unlocked={true}
                        teacherStaffId={teacherStaffId}
                        isCoachView={isCoachView}
                        onStatusChanged={onStatusChanged}
                      />
                    );
                  })}

                  {sdLevel2Skills.length > 0 && (
                    <>
                      {sdLevel2Skills.map((skill) => {
                        const statusDoc = statusMap.get(skill.id);
                        return (
                          <SkillCard
                            key={skill.id}
                            skill={{
                              ...skill,
                              domainId: domain.id,
                              domainName: domain.name,
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
                    </>
                  )}
                </Stack>
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
          onClick={() => onUnlockLevel2(level2Skills.map((s) => s.id))}
        >
          Unlock Level 2 Skills
        </Button>
      )}
    </Card>
  );
}
