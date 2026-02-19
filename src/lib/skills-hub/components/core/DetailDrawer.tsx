"use client";

import { Box, CloseButton, Group, Text } from "@mantine/core";

interface DetailDrawerProps {
  onClose: () => void;
  subtitle?: string;
  children: React.ReactNode;
}

export const DETAIL_DRAWER_WIDTH = 420;

export function DetailDrawer({
  onClose,
  subtitle,
  children,
}: DetailDrawerProps) {
  return (
    <Box
      style={{
        width: DETAIL_DRAWER_WIDTH,
        position: "fixed",
        right: 0,
        top: 0,
        bottom: 0,
        borderLeft: "1px solid var(--mantine-color-gray-3)",
        backgroundColor: "var(--mantine-color-white)",
        overflowY: "auto",
        zIndex: 40,
        boxShadow: "-2px 0 8px rgba(0,0,0,0.08)",
      }}
      p="md"
    >
      <Group justify="space-between" mb="md">
        <div>
          {subtitle && (
            <Text size="xs" c="dimmed">
              {subtitle}
            </Text>
          )}
        </div>
        <CloseButton onClick={onClose} />
      </Group>
      {children}
    </Box>
  );
}
