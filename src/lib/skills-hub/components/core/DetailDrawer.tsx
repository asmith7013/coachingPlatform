"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Box, CloseButton, Group, Text } from "@mantine/core";
import { useDrawerPortal } from "./DrawerPortalContext";

interface DetailDrawerProps {
  onClose: () => void;
  subtitle?: string;
  header?: React.ReactNode;
  children: React.ReactNode;
}

export const DETAIL_DRAWER_WIDTH = 420;

function useLayoutOffsets() {
  const [offsets, setOffsets] = useState({ top: 0, bottom: 0 });

  useEffect(() => {
    const nav = document.querySelector("nav");
    const footer = document.querySelector("footer");
    setOffsets({
      top: nav ? nav.offsetHeight : 0,
      bottom: footer ? footer.offsetHeight : 0,
    });
  }, []);

  return offsets;
}

export function DetailDrawer({
  onClose,
  subtitle,
  header,
  children,
}: DetailDrawerProps) {
  const portalTarget = useDrawerPortal();
  const { top, bottom } = useLayoutOffsets();

  const drawer = (
    <Box
      style={{
        width: DETAIL_DRAWER_WIDTH,
        position: "fixed",
        right: 0,
        top,
        bottom,
        borderLeft: "1px solid var(--mantine-color-gray-3)",
        backgroundColor: "var(--mantine-color-white)",
        overflowY: "auto",
        zIndex: 40,
        boxShadow: "-2px 0 8px rgba(0,0,0,0.08)",
      }}
      p="md"
    >
      <Group justify="space-between" mb="md" wrap="nowrap">
        <div style={{ flex: 1, minWidth: 0 }}>
          {header}
          {!header && subtitle && (
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

  if (portalTarget) {
    return createPortal(drawer, portalTarget);
  }
  return drawer;
}
