"use client";

import { useMemo } from "react";
import {
  Accordion,
  Badge,
  Breadcrumbs,
  Divider,
  Group,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { useTaxonomy } from "../../hooks/useTaxonomy";
import { useTeacherSkillStatuses } from "../../hooks/useTeacherSkillStatuses";
import { useSkillProgressions } from "../../hooks/useSkillProgressions";
import { useProgressionSteps } from "../../hooks/useProgressionSteps";
import { collectActiveSkills } from "../../core/active-skills";
import { SkillSoloCard } from "./SkillSoloCard";
import { SkillPairCard } from "./SkillPairCard";
import { SkillIconCircle } from "./SkillIconCircle";
import { StepChecklist } from "../skill-progressions/StepChecklist";
import { isSkillLocked } from "../../core/skill-lock";
import { getSkillStatus } from "../../core/skill-status.types";
import type { TeacherSkillStatusDocument } from "../../core/skill-status.types";
import type { TeacherSkill } from "../../core/taxonomy.types";

interface ActiveSkillsSummaryProps {
  teacherStaffId: string;
}

export function ActiveSkillsSummary({
  teacherStaffId,
}: ActiveSkillsSummaryProps) {
  const { taxonomy, loading: taxLoading } = useTaxonomy();
  const { statuses, loading: statusLoading } =
    useTeacherSkillStatuses(teacherStaffId);
  const { plans, loading: plansLoading } = useSkillProgressions(teacherStaffId);

  const statusMap = useMemo(() => {
    const map = new Map<string, TeacherSkillStatusDocument>();
    for (const s of statuses) {
      map.set(s.skillId, s);
    }
    return map;
  }, [statuses]);

  const openPlan = plans.find((p) => p.status === "open") ?? null;

  const {
    steps,
    loadingSteps,
    handleToggleStep,
    completedCount,
    totalSteps,
    progress,
  } = useProgressionSteps(openPlan?._id ?? null);

  const enrichedActiveSkills = useMemo(() => {
    if (!taxonomy) return [];
    const activeSkills = collectActiveSkills(taxonomy, statusMap);
    return activeSkills.map(
      ({ skill, domainName, subDomainName, subDomainSkills }) => {
        let pairedSkill: TeacherSkill | null = null;
        if (skill.level === 1 && skill.pairedSkillId) {
          pairedSkill =
            subDomainSkills.find((s) => s.uuid === skill.pairedSkillId) ?? null;
        } else if (skill.level === 2) {
          pairedSkill =
            subDomainSkills.find((s) => s.pairedSkillId === skill.uuid) ?? null;
        }
        return {
          skill,
          domainName,
          subDomainName,
          subDomainSkills,
          pairedSkill,
        };
      },
    );
  }, [taxonomy, statusMap]);

  if (taxLoading || statusLoading || plansLoading) {
    return (
      <Stack gap="xs">
        <Skeleton height={20} width="40%" />
        <Skeleton height={60} />
        <Skeleton height={60} />
      </Stack>
    );
  }

  if (!openPlan) {
    return (
      <Text size="sm" c="dimmed" py="sm">
        No active skill progression
      </Text>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 24,
        alignItems: "start",
      }}
    >
      {/* Left column: Active skill accordions */}
      <Stack gap="sm">
        <Text size="xs" fw={600} c="dimmed" tt="uppercase">
          Target Skills
        </Text>
        {enrichedActiveSkills.length > 0 ? (
          <Accordion multiple variant="separated" defaultValue={[]}>
            {enrichedActiveSkills.map(
              ({
                skill,
                domainName,
                subDomainName,
                subDomainSkills,
                pairedSkill,
              }) => {
                const l1 = skill.level === 1 ? skill : (pairedSkill ?? skill);
                const l2 = skill.level === 2 ? skill : (pairedSkill ?? null);

                return (
                  <Accordion.Item key={skill.uuid} value={skill.uuid}>
                    <Accordion.Control>
                      <Group gap="sm" wrap="nowrap">
                        <SkillIconCircle
                          skillId={skill.uuid}
                          status="active"
                          isLocked={false}
                          size={34}
                        />
                        <Text
                          size="sm"
                          fw={500}
                          lineClamp={1}
                          style={{ flex: 1, minWidth: 0 }}
                        >
                          {skill.name}
                        </Text>
                        <Badge size="sm" variant="light" color="blue">
                          L{skill.level}
                        </Badge>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap="sm">
                        <Breadcrumbs
                          separatorMargin={4}
                          styles={{
                            separator: {
                              color: "var(--mantine-color-dimmed)",
                            },
                          }}
                        >
                          <Text size="xs" c="dimmed">
                            {domainName}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {subDomainName}
                          </Text>
                        </Breadcrumbs>
                        {pairedSkill && l2 ? (
                          <SkillPairCard
                            compact
                            l1={{
                              skillId: l1.uuid,
                              skillName: l1.name,
                              description: l1.description,
                              status: getSkillStatus(statusMap, l1.uuid),
                              isLocked: false,
                              level: 1,
                            }}
                            l2={{
                              skillId: l2.uuid,
                              skillName: l2.name,
                              description: l2.description,
                              status: getSkillStatus(statusMap, l2.uuid),
                              isLocked: isSkillLocked(
                                l2,
                                statusMap,
                                subDomainSkills,
                              ),
                              level: 2,
                            }}
                          />
                        ) : (
                          <SkillSoloCard
                            skillId={skill.uuid}
                            skillName={skill.name}
                            description={skill.description}
                            level={skill.level}
                            status={getSkillStatus(statusMap, skill.uuid)}
                            isLocked={false}
                          />
                        )}
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                );
              },
            )}
          </Accordion>
        ) : (
          <Text size="sm" c="dimmed">
            No active skills yet
          </Text>
        )}
      </Stack>

      {/* Right column: Why + Steps */}
      <Stack gap="md">
        {openPlan.why && (
          <div>
            <Text size="xs" fw={600} c="dimmed" tt="uppercase">
              Why
            </Text>
            <Text size="sm">{openPlan.why}</Text>
          </div>
        )}

        <Divider />

        <StepChecklist
          steps={steps}
          completedCount={completedCount}
          totalSteps={totalSteps}
          progress={progress}
          loadingSteps={loadingSteps}
          onToggleStep={handleToggleStep}
        />
      </Stack>
    </div>
  );
}
