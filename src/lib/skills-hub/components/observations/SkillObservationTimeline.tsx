"use client";

import { Timeline, Text, Badge, Group, Stack } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { RATING_COLORS } from "../../coach/observations/observation.constants";
import type { ObservationDocument } from "../../coach/observations/observation.types";

interface SkillObservationTimelineProps {
  observations: ObservationDocument[];
  skillId: string;
}

export function SkillObservationTimeline({
  observations,
  skillId,
}: SkillObservationTimelineProps) {
  const relevantObs = observations
    .filter((obs) => obs.ratings.some((r) => r.skillId === skillId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (relevantObs.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        No observations recorded for this skill yet
      </Text>
    );
  }

  return (
    <Timeline active={relevantObs.length - 1} bulletSize={24}>
      {relevantObs.map((obs) => {
        const rating = obs.ratings.find((r) => r.skillId === skillId);
        if (!rating) return null;

        return (
          <Timeline.Item
            key={obs._id}
            bullet={<IconEye size={12} />}
            title={new Date(obs.date).toLocaleDateString()}
          >
            <Stack gap={4}>
              <Group gap="xs">
                <Badge size="sm" color={RATING_COLORS[rating.rating] || "gray"}>
                  {rating.rating.replace("_", " ")}
                </Badge>
                {obs.type && (
                  <Badge size="xs" variant="outline">
                    {obs.type.replace(/_/g, " ")}
                  </Badge>
                )}
              </Group>
              {rating.evidence && (
                <Text size="sm" c="dimmed">
                  {rating.evidence}
                </Text>
              )}
            </Stack>
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
}
