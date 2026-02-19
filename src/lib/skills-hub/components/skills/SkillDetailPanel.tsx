"use client";

import {
  Text,
  Title,
  Badge,
  Breadcrumbs,
  Anchor,
  Group,
  Stack,
  Box,
  Divider,
  Center,
  Loader,
  UnstyledButton,
} from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { useSkillsHubAuth } from "../layout/ViewAsContext";
import { useTaxonomy } from "../../hooks/useTaxonomy";
import { useTeacherSkillStatuses } from "../../hooks/useTeacherSkillStatuses";
import { useSkillProgressions } from "../../hooks/useSkillProgressions";
import { useObservations } from "../../hooks/useObservations";
import { getSkillByUuid } from "../../core/taxonomy";
import { isSkillLocked } from "../../core/skill-lock";
import { SkillStatusDot } from "./SkillStatusDot";
import { SkillObservationTimeline } from "../observations/SkillObservationTimeline";
// import { SkillNotesSection } from "../notes/SkillNotesSection";
import { PanelSkillProgressionSection } from "../skill-progressions/PanelSkillProgressionSection";
import { DetailDrawer } from "../core/DetailDrawer";
import { getSkillIcon } from "../../core/skill-icons";
import type { SkillStatus } from "../../core/skill-status.types";
import type { TeacherSkillFlat } from "../../core/taxonomy.types";
import type { TeacherSkillStatusDocument } from "../../core/skill-status.types";

interface SkillDetailContentProps {
  skillId: string;
  teacherStaffId: string;
  teacherName?: string;
  onSkillClick: (skillId: string) => void;
}

interface SkillDetailPanelProps extends SkillDetailContentProps {
  onClose: () => void;
}

function getStatusFromMap(
  statuses: TeacherSkillStatusDocument[],
  skillUuid: string,
): SkillStatus {
  const doc = statuses.find((s) => s.skillId === skillUuid);
  return (doc?.status as SkillStatus) || "not_started";
}

export function SkillDetailContent({
  skillId,
  teacherStaffId,
  teacherName,
  onSkillClick,
}: SkillDetailContentProps) {
  const { hasRole } = useSkillsHubAuth();

  const isCoach =
    hasRole("coach") || hasRole("super_admin") || hasRole("director");

  const { taxonomy, loading: taxLoading } = useTaxonomy();
  const { statuses, loading: statusLoading } =
    useTeacherSkillStatuses(teacherStaffId);
  const { plans } = useSkillProgressions(teacherStaffId);
  const { observations } = useObservations(teacherStaffId);

  const skill = taxonomy ? getSkillByUuid(taxonomy, skillId) : null;
  const pairedSkill =
    taxonomy && skill?.pairedSkillId
      ? getSkillByUuid(taxonomy, skill.pairedSkillId)
      : null;

  const currentStatus = skill
    ? getStatusFromMap(statuses, skill.uuid)
    : "not_started";
  const pairedStatus = pairedSkill
    ? getStatusFromMap(statuses, pairedSkill.uuid)
    : "not_started";

  const linkedPlans = skill
    ? plans.filter((p) => p.skillIds.includes(skill.uuid))
    : [];
  const Icon = getSkillIcon(skill?.uuid ?? "");

  // Build statusMap for isSkillLocked check
  const statusMap = new Map<string, TeacherSkillStatusDocument>();
  for (const s of statuses) {
    statusMap.set(s.skillId, s);
  }

  // Get all skills in subdomain for lock check
  const subDomainSkills = taxonomy
    ? (taxonomy.domains
        .flatMap((d) => d.subDomains)
        .find((sd) => sd.id === skill?.subDomainId)?.skills ?? [])
    : [];

  const pairedIsLocked = pairedSkill
    ? isSkillLocked(pairedSkill, statusMap, subDomainSkills)
    : false;

  // Order pair tiles: L1 first, L2 second
  const pairTiles =
    skill && pairedSkill
      ? skill.level === 1
        ? { l1: skill, l2: pairedSkill }
        : { l1: pairedSkill, l2: skill }
      : null;

  if (taxLoading || statusLoading) {
    return (
      <Center py="xl">
        <Loader size="sm" />
      </Center>
    );
  }

  if (!skill) {
    return (
      <Center py="xl">
        <Text c="dimmed">Skill not found</Text>
      </Center>
    );
  }

  return (
    <Stack gap="md">
      {/* Breadcrumb header */}
      <div>
        {isCoach && teacherName && (
          <Text size="xs" c="dimmed" mb={2}>
            Reviewing: {teacherName}
          </Text>
        )}
        <Breadcrumbs
          separator="›"
          styles={{ separator: { color: "var(--mantine-color-dimmed)" } }}
        >
          <Anchor size="xs" c="dimmed" underline="never">
            {skill.domainName}
          </Anchor>
          <Anchor size="xs" c="dimmed" underline="never">
            {skill.subDomainName}
          </Anchor>
        </Breadcrumbs>
      </div>

      {/* Skill detail */}
      <div>
        <Group gap="sm" wrap="nowrap" align="flex-start">
          <Box style={{ flexShrink: 0, marginTop: 4 }}>
            <Icon size={20} stroke={1.5} />
          </Box>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Title order={4}>{skill.name}</Title>
            {skill.description && (
              <Text size="sm" c="dimmed" mt={4}>
                {skill.description}
              </Text>
            )}
          </div>
          <Badge
            size="sm"
            variant="light"
            color="gray"
            style={{ flexShrink: 0, marginTop: 4 }}
          >
            L{skill.level}
          </Badge>
        </Group>
      </div>

      <Divider />

      <PanelSkillProgressionSection
        plans={linkedPlans}
        teacherStaffId={teacherStaffId}
      />

      <div>
        <Text fw={600} size="sm" mb="xs">
          Observation History
        </Text>
        <SkillObservationTimeline
          observations={observations}
          skillId={skill.uuid}
        />
      </div>
    </Stack>
  );
}

export function SkillDetailPanel({
  skillId,
  teacherStaffId,
  teacherName,
  onSkillClick,
  onClose,
}: SkillDetailPanelProps) {
  return (
    <DetailDrawer onClose={onClose}>
      <SkillDetailContent
        skillId={skillId}
        teacherStaffId={teacherStaffId}
        teacherName={teacherName}
        onSkillClick={onSkillClick}
      />
    </DetailDrawer>
  );
}
