"use client";

import {
  Card,
  Text,
  Box,
  Group,
  Badge,
  Accordion,
  UnstyledButton,
} from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { getSkillIcon } from "../../core/skill-icons";
import { SKILL_STATUS_COLORS } from "../../core/skill-status-colors";
import type { SkillStatus } from "../../core/skill-status.types";

interface SkillSoloCardBaseProps {
  skillId: string;
  skillName: string;
  description: string;
  level: 1 | 2;
  status: SkillStatus;
  isLocked: boolean;
  domainName?: string;
  compact?: boolean;
  rightSection?: React.ReactNode;
  onSkillClick?: (skillId: string) => void;
}

interface SkillSoloCardProps extends SkillSoloCardBaseProps {
  accordion?: false;
  children?: never;
}

interface SkillSoloCardAccordionProps extends SkillSoloCardBaseProps {
  accordion: true;
  children: React.ReactNode;
}

function CompactContent({
  skillId,
  skillName,
  level,
  status,
  isLocked,
  rightSection,
}: Pick<
  SkillSoloCardBaseProps,
  "skillId" | "skillName" | "level" | "status" | "isLocked" | "rightSection"
>) {
  const Icon = getSkillIcon(skillId);
  const colors = SKILL_STATUS_COLORS[status];

  return (
    <Group gap="xs" wrap="nowrap">
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
        {isLocked ? (
          <IconLock size={16} color="var(--mantine-color-gray-5)" />
        ) : (
          <Icon size={16} stroke={1.5} color={colors.iconColor} />
        )}
      </Box>
      <Text size="sm" fw={500} lineClamp={1} style={{ flex: 1, minWidth: 0 }}>
        {skillName}
      </Text>
      {rightSection}
      <Text size="xs" c="dimmed" fw={500} style={{ flexShrink: 0 }}>
        L{level}
      </Text>
    </Group>
  );
}

export function SkillSoloCard(
  props: SkillSoloCardProps | SkillSoloCardAccordionProps,
) {
  const {
    skillId,
    skillName,
    description,
    level,
    status,
    isLocked,
    domainName,
    compact,
    accordion,
    rightSection,
    onSkillClick,
  } = props;

  const Icon = getSkillIcon(skillId);
  const colors = SKILL_STATUS_COLORS[status];

  // Accordion mode: render as Accordion.Item with compact content as control
  if (accordion) {
    return (
      <Accordion.Item value={skillId}>
        <Accordion.Control>
          <CompactContent
            skillId={skillId}
            skillName={skillName}
            level={level}
            status={status}
            isLocked={isLocked}
            rightSection={rightSection}
          />
        </Accordion.Control>
        <Accordion.Panel>
          {(props as SkillSoloCardAccordionProps).children}
        </Accordion.Panel>
      </Accordion.Item>
    );
  }

  // Standard card mode
  const content = (
    <Card
      shadow="xs"
      withBorder
      p="sm"
      style={{
        opacity: isLocked ? 0.5 : 1,
        cursor: isLocked ? "default" : "pointer",
      }}
    >
      {compact ? (
        <CompactContent
          skillId={skillId}
          skillName={skillName}
          level={level}
          status={status}
          isLocked={isLocked}
          rightSection={rightSection}
        />
      ) : (
        <Group gap="sm" wrap="nowrap">
          <Box
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: colors.iconBg,
              border: `2px solid ${colors.iconBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {isLocked ? (
              <IconLock size={18} color="var(--mantine-color-gray-5)" />
            ) : (
              <Icon size={18} stroke={1.5} color={colors.iconColor} />
            )}
          </Box>
          <div style={{ minWidth: 0 }}>
            <Text size="xs" c="dimmed" fw={500}>
              Level {level}
            </Text>
            <Text size="sm" fw={500} lineClamp={2}>
              {skillName}
            </Text>
            {description && (
              <Text size="xs" c="dimmed" lineClamp={2} mt={2}>
                {description}
              </Text>
            )}
            {domainName && (
              <Badge size="xs" variant="light" color="blue" mt={4}>
                {domainName}
              </Badge>
            )}
          </div>
        </Group>
      )}
    </Card>
  );

  if (isLocked) {
    return content;
  }

  return (
    <UnstyledButton
      onClick={() => onSkillClick?.(skillId)}
      w={compact ? undefined : "100%"}
    >
      {content}
    </UnstyledButton>
  );
}
