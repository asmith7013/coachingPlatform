"use client";

import {
  Text,
  Title,
  Breadcrumbs,
  Anchor,
  Group,
  Stack,
  Box,
  Divider,
  SegmentedControl,
  Center,
  Loader,
  UnstyledButton,
} from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSkillsHubAuth } from "../layout/ViewAsContext";
import { useTaxonomy } from "../../hooks/useTaxonomy";
import {
  useTeacherSkillStatuses,
  skillStatusKeys,
} from "../../hooks/useTeacherSkillStatuses";
import { useSkillProgressions } from "../../hooks/useSkillProgressions";
import { useObservations } from "../../hooks/useObservations";
import { getSkillByUuid } from "../../core/taxonomy";
import { isSkillLocked } from "../../core/skill-lock";
import { updateSkillStatus } from "../../core/skill-status.actions";
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

const STATUS_OPTIONS = [
  { label: "Not Started", value: "not_started" },
  { label: "Active", value: "active" },
  { label: "Developing", value: "developing" },
  { label: "Proficient", value: "proficient" },
];

function PairTile({
  skill,
  status,
  isSelected,
  locked,
  onClick,
}: {
  skill: TeacherSkillFlat;
  status: SkillStatus;
  isSelected: boolean;
  locked: boolean;
  onClick?: () => void;
}) {
  const Icon = getSkillIcon(skill.uuid);

  const content = (
    <Box
      p="xs"
      style={{
        borderRadius: "var(--mantine-radius-sm)",
        border: isSelected
          ? "2px solid var(--mantine-color-teal-5)"
          : "1px solid var(--mantine-color-gray-3)",
        backgroundColor: isSelected
          ? "var(--mantine-color-teal-0)"
          : "var(--mantine-color-white)",
        opacity: locked ? 0.5 : 1,
        cursor: isSelected || locked ? "default" : "pointer",
      }}
    >
      <Group gap={6} wrap="nowrap">
        <Box
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            backgroundColor: "var(--mantine-color-gray-1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {locked ? (
            <IconLock size={12} color="var(--mantine-color-gray-5)" />
          ) : (
            <Icon size={12} stroke={1.5} />
          )}
        </Box>
        <Text size="xs" fw={500} lineClamp={1} style={{ flex: 1, minWidth: 0 }}>
          {skill.name}
        </Text>
        <SkillStatusDot status={status} size={10} />
      </Group>
      <Text size="xs" c="dimmed" mt={2}>
        Level {skill.level}
      </Text>
    </Box>
  );

  if (isSelected || locked) return content;

  return <UnstyledButton onClick={onClick}>{content}</UnstyledButton>;
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
  const queryClient = useQueryClient();

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

  const handleStatusChange = async (value: string) => {
    if (!skill) return;
    await updateSkillStatus(teacherStaffId, skill.uuid, value as SkillStatus);
    queryClient.invalidateQueries({
      queryKey: skillStatusKeys.byTeacher(teacherStaffId),
    });
  };

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

      {/* Pair row */}
      {pairTiles && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}
        >
          <PairTile
            skill={pairTiles.l1}
            status={
              pairTiles.l1.uuid === skill.uuid ? currentStatus : pairedStatus
            }
            isSelected={pairTiles.l1.uuid === skill.uuid}
            locked={false}
            onClick={() => onSkillClick(pairTiles.l1.uuid)}
          />
          <PairTile
            skill={pairTiles.l2}
            status={
              pairTiles.l2.uuid === skill.uuid ? currentStatus : pairedStatus
            }
            isSelected={pairTiles.l2.uuid === skill.uuid}
            locked={pairTiles.l2.uuid !== skill.uuid ? pairedIsLocked : false}
            onClick={() => onSkillClick(pairTiles.l2.uuid)}
          />
        </div>
      )}

      {/* Skill detail */}
      <div>
        <Group gap="sm" mb="xs">
          <Icon size={20} stroke={1.5} />
          <Title order={4}>{skill.name}</Title>
        </Group>
        {skill.description && (
          <Text size="sm" mt="xs">
            {skill.description}
          </Text>
        )}
      </div>

      {isCoach && (
        <>
          <Divider />
          <div>
            <Text size="xs" fw={500} mb="xs">
              Status
            </Text>
            <SegmentedControl
              data={STATUS_OPTIONS}
              value={currentStatus}
              onChange={handleStatusChange}
              size="xs"
              fullWidth
            />
          </div>
        </>
      )}

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
