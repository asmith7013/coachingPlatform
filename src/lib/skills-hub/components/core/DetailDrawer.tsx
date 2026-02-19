"use client";

import { useLayoutEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Box, CloseButton, Divider, Group, Text } from "@mantine/core";
import { IconPinFilled } from "@tabler/icons-react";
import { useDrawerPortal } from "./DrawerPortalContext";

export interface DrawerTab {
  id: string;
  label: string;
  pinned?: boolean;
  closable?: boolean;
}

export interface DrawerTabsConfig {
  items: DrawerTab[];
  activeId: string;
  onChange: (id: string) => void;
  onClose: (id: string) => void;
}

interface DetailDrawerProps {
  onClose: () => void;
  showCloseButton?: boolean;
  subtitle?: string;
  header?: React.ReactNode;
  tabs?: DrawerTabsConfig;
  children: React.ReactNode;
}

export const DETAIL_DRAWER_WIDTH = 420;

function useLayoutOffsets() {
  const [offsets, setOffsets] = useState({ top: 0, bottom: 0 });

  const measure = useCallback(() => {
    const nav = document.querySelector("nav");
    const footer = document.querySelector("footer");
    setOffsets({
      top: nav ? nav.offsetHeight : 0,
      bottom: footer ? footer.offsetHeight : 0,
    });
  }, []);

  useLayoutEffect(() => {
    measure();

    // Re-measure when footer appears/disappears
    const observer = new MutationObserver(measure);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [measure]);

  return offsets;
}

function DrawerTabStrip({ tabs }: { tabs: DrawerTabsConfig }) {
  return (
    <Group gap={4} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
      {tabs.items.map((tab) => {
        const isActive = tab.id === tabs.activeId;
        return (
          <div
            key={tab.id}
            role="button"
            tabIndex={0}
            onClick={() => tabs.onChange(tab.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                tabs.onChange(tab.id);
              }
            }}
            style={{
              borderRadius: "var(--mantine-radius-sm)",
              backgroundColor: isActive
                ? "var(--mantine-color-blue-0)"
                : "transparent",
              border: isActive
                ? "1px solid var(--mantine-color-blue-3)"
                : "1px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: 4,
              maxWidth: 160,
              flexShrink: 1,
              minWidth: 0,
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            {tab.pinned && (
              <IconPinFilled
                size={12}
                color="var(--mantine-color-blue-5)"
                style={{ flexShrink: 0 }}
              />
            )}
            <Text
              size="xs"
              fw={isActive ? 600 : 400}
              c={isActive ? "blue.7" : "dimmed"}
              truncate
              style={{ flex: 1, minWidth: 0 }}
            >
              {tab.label}
            </Text>
            {tab.closable !== false && (
              <CloseButton
                size="xs"
                variant="subtle"
                onClick={(e) => {
                  e.stopPropagation();
                  tabs.onClose(tab.id);
                }}
                style={{ flexShrink: 0 }}
              />
            )}
          </div>
        );
      })}
    </Group>
  );
}

export function DetailDrawer({
  onClose,
  showCloseButton = true,
  subtitle,
  header,
  tabs,
  children,
}: DetailDrawerProps) {
  const portalTarget = useDrawerPortal();
  const { top, bottom } = useLayoutOffsets();

  const hasHeader = !!(tabs || header || subtitle);

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
      {showCloseButton && (
        <CloseButton
          onClick={onClose}
          style={{ position: "absolute", top: 12, right: 12, zIndex: 1 }}
        />
      )}
      {hasHeader && (
        <Group
          mb={4}
          wrap="nowrap"
          style={showCloseButton ? { paddingRight: 32 } : undefined}
        >
          {tabs ? (
            <DrawerTabStrip tabs={tabs} />
          ) : (
            <div style={{ flex: 1, minWidth: 0 }}>
              {header}
              {!header && subtitle && (
                <Text size="xs" c="dimmed">
                  {subtitle}
                </Text>
              )}
            </div>
          )}
        </Group>
      )}
      {hasHeader && <Divider mb="sm" />}
      {children}
    </Box>
  );

  if (portalTarget) {
    return createPortal(drawer, portalTarget);
  }
  return drawer;
}
