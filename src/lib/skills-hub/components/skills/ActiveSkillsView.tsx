"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  Breadcrumbs,
  Text,
  Title,
  Stack,
  Group,
  Badge,
  Box,
  Checkbox,
  Divider,
  Progress,
  Center,
  Loader,
} from "@mantine/core";
import { useTaxonomy } from "../../hooks/useTaxonomy";
import { useTeacherSkillStatuses } from "../../hooks/useTeacherSkillStatuses";
import { useSkillProgressions } from "../../hooks/useSkillProgressions";
import {
  getProgressionSteps,
  completeProgressionStep,
  uncompleteProgressionStep,
} from "../../coach/skill-progressions/progression-step.actions";
import { SkillProgressRing, collectActiveSkills } from "./ProgressStatsRow";
import { SkillSoloCard } from "./SkillSoloCard";
import { SkillPairCard } from "./SkillPairCard";
import { DomainAccordion } from "./DomainAccordion";
import { SkillDetailContent } from "./SkillDetailPanel";
import { DetailDrawer, DETAIL_DRAWER_WIDTH } from "../core/DetailDrawer";
import { formatDueDate } from "../../core/format-due-date";
import { getSkillIcon } from "../../core/skill-icons";
import { SKILL_STATUS_COLORS } from "../../core/skill-status-colors";
import { isSkillLocked } from "../../core/skill-lock";
import {
  getSkillStatus,
  type TeacherSkillStatusDocument,
} from "../../core/skill-status.types";
import type { ProgressionStepDocument } from "../../coach/skill-progressions/progression-step.types";
import type { TeacherSkill } from "../../core/taxonomy.types";

interface ActiveSkillsViewProps {
  teacherStaffId: string;
}

export function ActiveSkillsView({ teacherStaffId }: ActiveSkillsViewProps) {
  const { taxonomy, loading: taxLoading } = useTaxonomy();
  const { statuses, loading: statusLoading } =
    useTeacherSkillStatuses(teacherStaffId);
  const { plans } = useSkillProgressions(teacherStaffId);

  const statusMap = useMemo(() => {
    const map = new Map<string, TeacherSkillStatusDocument>();
    for (const s of statuses) {
      map.set(s.skillId, s);
    }
    return map;
  }, [statuses]);

  const openPlan = plans.find((p) => p.status === "open") ?? null;

  const [steps, setSteps] = useState<ProgressionStepDocument[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  useEffect(() => {
    if (!openPlan) {
      setSteps([]);
      return;
    }
    setLoadingSteps(true);
    getProgressionSteps(openPlan._id).then((result) => {
      if (result.success && result.data) {
        setSteps(result.data);
      }
      setLoadingSteps(false);
    });
  }, [openPlan]);

  // For each active skill, find its paired skill (if any) so we can render SkillPairCard
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

  const completedCount = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  const domainsWithSkills = useMemo(
    () =>
      taxonomy
        ? taxonomy.domains.filter((d) =>
            d.subDomains.some((sd) => sd.skills.length > 0),
          )
        : [],
    [taxonomy],
  );

  const expandedSubDomainsByDomain = useMemo(() => {
    if (!taxonomy) return new Map<string, string[]>();
    const result = new Map<string, string[]>();
    for (const domain of taxonomy.domains) {
      const expanded = domain.subDomains
        .filter((sd) =>
          sd.skills.some(
            (skill) => statusMap.get(skill.uuid)?.status === "active",
          ),
        )
        .map((sd) => sd.id);
      if (expanded.length > 0) {
        result.set(domain.id, expanded);
      }
    }
    return result;
  }, [taxonomy, statusMap]);

  const handleSkillClick = useCallback((skillId: string) => {
    setSelectedSkillId(skillId);
    setDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    setSelectedSkillId(null);
  }, []);

  const handleToggleStep = async (stepId: string, completed: boolean) => {
    if (completed) {
      await uncompleteProgressionStep(stepId);
      setSteps((prev) =>
        prev.map((s) =>
          s._id === stepId ? { ...s, completed: false, completedAt: null } : s,
        ),
      );
    } else {
      await completeProgressionStep(stepId);
      setSteps((prev) =>
        prev.map((s) =>
          s._id === stepId
            ? { ...s, completed: true, completedAt: new Date().toISOString() }
            : s,
        ),
      );
    }
  };

  if (taxLoading || statusLoading) {
    return (
      <Center py="xl">
        <Loader size="sm" />
      </Center>
    );
  }

  if (!taxonomy) {
    return (
      <Center py="xl">
        <Text c="dimmed">No taxonomy data available</Text>
      </Center>
    );
  }

  return (
    <div style={{ display: "flex", gap: 16 }}>
      <Stack gap="lg" style={{ flex: 1, minWidth: 0 }}>
        {/* Header: Title left, Ring right */}
        <Group justify="space-between" align="center" wrap="nowrap">
          <div>
            <Title order={2}>Active Skills</Title>
            <Text size="sm" c="dimmed">
              Your current focus and next steps
            </Text>
          </div>
          <SkillProgressRing taxonomy={taxonomy} statusMap={statusMap} />
        </Group>

        <Divider />

        {!openPlan ? (
          <Center py="xl">
            <Text c="dimmed">No active skill progression</Text>
          </Center>
        ) : (
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
                <Accordion
                  multiple
                  variant="separated"
                  defaultValue={enrichedActiveSkills.map((a) => a.skill.uuid)}
                >
                  {enrichedActiveSkills.map(
                    ({
                      skill,
                      domainName,
                      subDomainName,
                      subDomainSkills,
                      pairedSkill,
                    }) => {
                      const Icon = getSkillIcon(skill.uuid);
                      const colors = SKILL_STATUS_COLORS["active"];
                      const l1 =
                        skill.level === 1 ? skill : (pairedSkill ?? skill);
                      const l2 =
                        skill.level === 2 ? skill : (pairedSkill ?? null);

                      return (
                        <Accordion.Item key={skill.uuid} value={skill.uuid}>
                          <Accordion.Control>
                            <Group gap="sm" wrap="nowrap">
                              <Box
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: "50%",
                                  backgroundColor: colors.iconBg,
                                  border: `2px solid ${colors.iconBorder}`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <Icon
                                  size={16}
                                  stroke={1.5}
                                  color={colors.iconColor}
                                />
                              </Box>
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

              {loadingSteps ? (
                <Text size="sm" c="dimmed">
                  Loading steps...
                </Text>
              ) : totalSteps > 0 ? (
                <div>
                  <Group gap="xs" mb="xs" align="center">
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                      Steps
                    </Text>
                    <Progress
                      value={progress}
                      size="sm"
                      color="blue"
                      style={{ flex: 1 }}
                    />
                    <Text size="xs" c="dimmed" fw={500}>
                      {completedCount}/{totalSteps}
                    </Text>
                  </Group>
                  <Stack gap="xs">
                    {steps.map((step) => (
                      <Group
                        key={step._id}
                        gap="sm"
                        wrap="nowrap"
                        align="flex-start"
                      >
                        <Checkbox
                          color="blue"
                          checked={step.completed}
                          onChange={() =>
                            handleToggleStep(step._id, step.completed)
                          }
                          mt={2}
                          styles={{ input: { cursor: "pointer" } }}
                        />
                        <Text
                          size="sm"
                          td={step.completed ? "line-through" : undefined}
                          c={step.completed ? "dimmed" : undefined}
                          style={{ flex: 1, minWidth: 0 }}
                        >
                          {step.description}
                        </Text>
                        {step.dueDate && (
                          <Badge
                            size="sm"
                            variant="light"
                            color="blue"
                            style={{ flexShrink: 0 }}
                          >
                            {formatDueDate(step.dueDate)}
                          </Badge>
                        )}
                      </Group>
                    ))}
                  </Stack>
                </div>
              ) : (
                <Text size="sm" c="dimmed">
                  No steps defined yet
                </Text>
              )}
            </Stack>
          </div>
        )}
      </Stack>

      {/* Panel: DomainAccordion or SkillDetailContent */}
      {drawerOpen && (
        <>
          <div style={{ width: DETAIL_DRAWER_WIDTH, flexShrink: 0 }} />
          <DetailDrawer onClose={handleDrawerClose}>
            {selectedSkillId ? (
              <SkillDetailContent
                skillId={selectedSkillId}
                teacherStaffId={teacherStaffId}
              />
            ) : (
              <Stack gap="md">
                <Text fw={700} size="lg">
                  Skill Domains
                </Text>
                <DomainAccordion
                  domains={domainsWithSkills}
                  statusMap={statusMap}
                  defaultExpandedSubDomainsByDomain={expandedSubDomainsByDomain}
                  compact
                  onSkillClick={handleSkillClick}
                />
              </Stack>
            )}
          </DetailDrawer>
        </>
      )}
    </div>
  );
}
