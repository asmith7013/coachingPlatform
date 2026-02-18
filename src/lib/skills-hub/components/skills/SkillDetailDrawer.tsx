"use client";

import {
  Drawer,
  Text,
  Title,
  Badge,
  Group,
  Stack,
  Card,
  Divider,
  SegmentedControl,
  Center,
  Loader,
} from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { useSkillsHubAuth } from "../layout/ViewAsContext";
import { useTaxonomy } from "../../hooks/useTaxonomy";
import {
  useTeacherSkillStatuses,
  skillStatusKeys,
} from "../../hooks/useTeacherSkillStatuses";
import { useActionPlans } from "../../hooks/useActionPlans";
import { useObservations } from "../../hooks/useObservations";
import { getSkillById } from "../../core/taxonomy";
import { updateSkillStatus } from "../../core/skill-status.actions";
import { SkillStatusBadge } from "../core/SkillStatusBadge";
import { SkillObservationTimeline } from "../observations/SkillObservationTimeline";
import { SkillNotesSection } from "../notes/SkillNotesSection";
import { getSkillIcon } from "../../core/skill-icons";
import type { SkillStatus } from "../../core/skill-status.types";

interface SkillDetailDrawerProps {
  skillId: string | null;
  teacherStaffId: string;
  opened: boolean;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { label: "Not Started", value: "not_started" },
  { label: "Active", value: "active" },
  { label: "Developing", value: "developing" },
  { label: "Proficient", value: "proficient" },
];

export function SkillDetailDrawer({
  skillId,
  teacherStaffId,
  opened,
  onClose,
}: SkillDetailDrawerProps) {
  const { hasRole } = useSkillsHubAuth();
  const queryClient = useQueryClient();

  const isCoach =
    hasRole("coach") || hasRole("super_admin") || hasRole("director");

  const { taxonomy, loading: taxLoading } = useTaxonomy();
  const { statuses, loading: statusLoading } =
    useTeacherSkillStatuses(teacherStaffId);
  const { plans } = useActionPlans(teacherStaffId);
  const { observations } = useObservations(teacherStaffId);

  const skill = taxonomy && skillId ? getSkillById(taxonomy, skillId) : null;
  const statusDoc = skill
    ? statuses.find((s) => s.skillId === skill.uuid)
    : undefined;
  const currentStatus: SkillStatus =
    (statusDoc?.status as SkillStatus) || "not_started";
  const linkedPlans = skill
    ? plans.filter((p) => p.skillIds.includes(skill.uuid))
    : [];
  const Icon = skillId ? getSkillIcon(skillId) : null;

  const handleStatusChange = async (value: string) => {
    if (!skill) return;
    await updateSkillStatus(teacherStaffId, skill.uuid, value as SkillStatus);
    queryClient.invalidateQueries({
      queryKey: skillStatusKeys.byTeacher(teacherStaffId),
    });
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      title={
        skill ? (
          <Group gap="sm">
            {Icon && <Icon size={20} stroke={1.5} />}
            <Title order={4}>{skill.name}</Title>
          </Group>
        ) : (
          "Skill Detail"
        )
      }
    >
      {(taxLoading || statusLoading) && (
        <Center py="xl">
          <Loader size="sm" />
        </Center>
      )}

      {!taxLoading && !statusLoading && !skill && (
        <Center py="xl">
          <Text c="dimmed">Skill not found</Text>
        </Center>
      )}

      {skill && (
        <Stack gap="md">
          <div>
            <Group gap="xs" mb="xs">
              <Badge
                variant="outline"
                color={skill.level === 1 ? "blue" : "violet"}
                size="sm"
              >
                Level {skill.level}
              </Badge>
              <SkillStatusBadge status={currentStatus} />
            </Group>
            <Text size="sm" c="dimmed">
              {skill.domainName} &rsaquo; {skill.subDomainName}
            </Text>
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

          {linkedPlans.length > 0 && (
            <div>
              <Text fw={600} size="sm" mb="xs">
                Action Plans
              </Text>
              <Stack gap="xs">
                {linkedPlans.map((plan) => (
                  <Card key={plan._id} withBorder p="sm">
                    <Text size="sm" fw={500}>
                      {plan.title}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Status: {plan.status}
                    </Text>
                  </Card>
                ))}
              </Stack>
            </div>
          )}

          <div>
            <Text fw={600} size="sm" mb="xs">
              Observation History
            </Text>
            <SkillObservationTimeline
              observations={observations}
              skillId={skill.uuid}
            />
          </div>

          <div>
            <Text fw={600} size="sm" mb="xs">
              Notes
            </Text>
            <SkillNotesSection
              teacherStaffId={teacherStaffId}
              skillId={skill.uuid}
              isCoachView={isCoach}
            />
          </div>
        </Stack>
      )}
    </Drawer>
  );
}
