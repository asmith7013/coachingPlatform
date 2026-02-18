"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MultiSelect,
  Textarea,
  Button,
  Stack,
  Group,
  Card,
  Text,
  Chip,
  Grid,
  Box,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconBook,
  IconRocket,
  IconUsers,
  IconUsersGroup,
  IconBulb,
  IconFlag,
  IconHeart,
} from "@tabler/icons-react";
import { useTaxonomy } from "../../hooks/useTaxonomy";
import { createActionPlanWithSteps } from "../../coach/action-plans/action-plan.actions";
import { CoachTeacherSelector } from "../core/CoachTeacherSelector";
import type { TeacherSkillDomain } from "../../core/taxonomy.types";

interface ActionPlanFormProps {
  teacherStaffId: string;
}

const DOMAIN_ICONS: Record<string, React.ReactNode> = {
  "Intellectual Preparation": <IconBook size={18} />,
  "Lesson Launch": <IconRocket size={18} />,
  "1:1 Coaching": <IconUsers size={18} />,
  "Small Group Instruction": <IconUsersGroup size={18} />,
  "Inquiry Groups": <IconBulb size={18} />,
  "Lesson Closing": <IconFlag size={18} />,
  Culture: <IconHeart size={18} />,
};

export function ActionPlanForm({ teacherStaffId }: ActionPlanFormProps) {
  const router = useRouter();
  const { taxonomy } = useTaxonomy();
  const [domainIds, setDomainIds] = useState<string[]>([]);
  const [skillIds, setSkillIds] = useState<string[]>([]);
  const [why, setWhy] = useState("");
  const [actionStep, setActionStep] = useState("");
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
    teacherStaffId,
  );
  const [submitting, setSubmitting] = useState(false);

  const domainOptions =
    taxonomy?.domains.map((d) => ({
      value: d.uuid,
      label: d.name,
    })) ?? [];

  const selectedDomains: TeacherSkillDomain[] =
    taxonomy?.domains.filter((d) => domainIds.includes(d.uuid)) ?? [];

  const toggleSkill = (uuid: string) => {
    setSkillIds((prev) =>
      prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid],
    );
  };

  const handleDomainChange = (values: string[]) => {
    setDomainIds(values);
    // Remove skills from deselected domains
    const remainingDomains =
      taxonomy?.domains.filter((d) => values.includes(d.uuid)) ?? [];
    const validSkillUuids = new Set(
      remainingDomains.flatMap((d) =>
        d.subDomains.flatMap((sd) => sd.skills.map((s) => s.uuid)),
      ),
    );
    setSkillIds((prev) => prev.filter((id) => validSkillUuids.has(id)));
  };

  const handleSubmit = async () => {
    if (!selectedTeacherId) {
      notifications.show({
        title: "Validation Error",
        message: "Select a teacher",
        color: "red",
      });
      return;
    }
    if (skillIds.length === 0) {
      notifications.show({
        title: "Validation Error",
        message: "Select at least one skill",
        color: "red",
      });
      return;
    }

    const title = selectedDomains.map((d) => d.name).join(", ");

    setSubmitting(true);

    const result = await createActionPlanWithSteps({
      plan: {
        teacherStaffId: selectedTeacherId,
        title,
        skillIds,
        why: why.trim() || undefined,
        actionStep: actionStep.trim() || undefined,
      },
      steps: [],
    });

    setSubmitting(false);

    if (result.success) {
      notifications.show({
        title: "Success",
        message: "Action plan created",
        color: "teal",
      });
      router.push(`/skillsHub/teacher/${selectedTeacherId}/action-plans`);
    } else {
      notifications.show({
        title: "Error",
        message: result.error || "Failed to create plan",
        color: "red",
      });
    }
  };

  return (
    <Stack gap="lg">
      <CoachTeacherSelector
        selectedCoachId={selectedCoachId}
        onCoachChange={setSelectedCoachId}
        selectedTeacherId={selectedTeacherId}
        onTeacherChange={setSelectedTeacherId}
      />

      <Grid gutter="lg">
        <Grid.Col span={8}>
          <Stack gap="lg">
            <Card shadow="sm" p="lg" withBorder>
              <Text fw={600} size="lg" mb="sm">
                Select Domains
              </Text>
              <MultiSelect
                placeholder="Select focus areas"
                data={domainOptions}
                value={domainIds}
                onChange={handleDomainChange}
                searchable
                size="md"
              />
            </Card>

            {selectedDomains.map((domain) => (
              <Card key={domain.uuid} shadow="sm" p="lg" withBorder>
                <Group gap="xs" mb="md">
                  {DOMAIN_ICONS[domain.name]}
                  <Text fw={600} size="lg">
                    {domain.name}
                  </Text>
                </Group>

                <Stack gap="sm">
                  {domain.subDomains.map((sd) => (
                    <div key={sd.uuid}>
                      <Text size="sm" c="dimmed" fw={500} mb={4}>
                        {sd.name}
                      </Text>
                      <Group gap="xs">
                        {sd.skills.map((skill) => (
                          <Chip
                            key={skill.uuid}
                            checked={skillIds.includes(skill.uuid)}
                            onChange={() => toggleSkill(skill.uuid)}
                            size="sm"
                          >
                            {skill.name}
                          </Chip>
                        ))}
                      </Group>
                    </div>
                  ))}
                </Stack>
              </Card>
            ))}

            <Group justify="flex-end">
              <Button
                variant="default"
                onClick={() => router.back()}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                loading={submitting}
                disabled={skillIds.length === 0}
              >
                Create Plan
              </Button>
            </Group>
          </Stack>
        </Grid.Col>

        <Grid.Col span={4}>
          <Box pos="sticky" top={20}>
            <Card shadow="sm" p="lg" withBorder>
              <Stack gap="md">
                <Text fw={600}>Coach Notes</Text>

                <Textarea
                  label="Why"
                  placeholder="Why should this teacher develop these skills?"
                  value={why}
                  onChange={(e) => setWhy(e.currentTarget.value)}
                  autosize
                  minRows={4}
                />

                <Textarea
                  label="Action Step"
                  placeholder="How should the teacher implement this?"
                  value={actionStep}
                  onChange={(e) => setActionStep(e.currentTarget.value)}
                  autosize
                  minRows={4}
                />
              </Stack>
            </Card>
          </Box>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
