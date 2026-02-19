"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Text,
  Title,
  Stack,
  Group,
  Divider,
  Center,
  Loader,
} from "@mantine/core";
import { useTaxonomy } from "../../hooks/useTaxonomy";
import { useTeacherSkillStatuses } from "../../hooks/useTeacherSkillStatuses";
import { SkillProgressRing } from "./ProgressStatsRow";
import { ActiveSkillsSummary } from "./ActiveSkillsSummary";
import { DomainAccordion } from "./DomainAccordion";
import { SkillDetailContent } from "./SkillDetailPanel";
import { DetailDrawer, DETAIL_DRAWER_WIDTH } from "../core/DetailDrawer";
import type { DrawerTab } from "../core/DetailDrawer";
import { DrawerObservationForm } from "../observations/DrawerObservationForm";
import type { TeacherSkillStatusDocument } from "../../core/skill-status.types";
import { getSkillByUuid } from "../../core/taxonomy";

const MAX_TABS = 4;
const DOMAINS_TAB_ID = "__domains__";
const OBSERVE_TAB_ID = "__observe__";

interface ActiveSkillsViewProps {
  teacherStaffId: string;
  showObservations?: boolean;
  headerContent?: React.ReactNode;
}

export function ActiveSkillsView({
  teacherStaffId,
  showObservations = false,
  headerContent,
}: ActiveSkillsViewProps) {
  const { taxonomy, loading: taxLoading } = useTaxonomy();
  const { statuses, loading: statusLoading } =
    useTeacherSkillStatuses(teacherStaffId);

  const statusMap = useMemo(() => {
    const map = new Map<string, TeacherSkillStatusDocument>();
    for (const s of statuses) {
      map.set(s.skillId, s);
    }
    return map;
  }, [statuses]);

  const domainsWithSkills = useMemo(
    () =>
      taxonomy
        ? taxonomy.domains.filter((d) =>
            d.subDomains.some((sd) => sd.skills.length > 0),
          )
        : [],
    [taxonomy],
  );

  const expandedSubDomainsByDomain = useMemo(
    () => new Map<string, string[]>(),
    [],
  );

  // Simple drawer state (no tabs mode)
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  // Tabbed drawer state (observations mode)
  const pinnedTabIds = useMemo(
    () =>
      showObservations ? [DOMAINS_TAB_ID, OBSERVE_TAB_ID] : [DOMAINS_TAB_ID],
    [showObservations],
  );
  const pinnedSet = useMemo(() => new Set(pinnedTabIds), [pinnedTabIds]);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Initialize tabs when in observations mode
  useEffect(() => {
    if (showObservations && openTabs.length === 0) {
      setOpenTabs([...pinnedTabIds]);
      setActiveTab(DOMAINS_TAB_ID);
    }
  }, [showObservations, pinnedTabIds, openTabs.length]);

  // Skill click handler — simple mode vs tabbed mode
  const handleSkillClick = useCallback(
    (skillId: string) => {
      if (!showObservations) {
        setSelectedSkillId(skillId);
        setDrawerOpen(true);
        return;
      }

      // Tabbed mode: open skill in a tab
      const maxSkillTabs = MAX_TABS - pinnedTabIds.length;

      setOpenTabs((prev) => {
        if (prev.includes(skillId)) {
          setActiveTab(skillId);
          return prev;
        }

        const skillTabs = prev.filter((id) => !pinnedSet.has(id));

        if (skillTabs.length < maxSkillTabs) {
          setActiveTab(skillId);
          return [...prev, skillId];
        }

        // One-in-one-out: replace active skill tab, or last skill tab
        setActiveTab((currentActive) => {
          const replaceId =
            currentActive && !pinnedSet.has(currentActive)
              ? currentActive
              : skillTabs[skillTabs.length - 1];
          if (!replaceId) return currentActive;
          setOpenTabs((p) => p.map((id) => (id === replaceId ? skillId : id)));
          return skillId;
        });
        return prev;
      });
    },
    [showObservations, pinnedSet, pinnedTabIds.length],
  );

  const handleDrawerClose = useCallback(() => {
    if (!showObservations) {
      setDrawerOpen(false);
      setSelectedSkillId(null);
      return;
    }
    // Tabbed mode: reset to pinned tabs
    setOpenTabs([...pinnedTabIds]);
    setActiveTab(pinnedTabIds[0]);
  }, [showObservations, pinnedTabIds]);

  const handleTabClose = useCallback(
    (tabId: string) => {
      if (pinnedSet.has(tabId)) return;
      setOpenTabs((prev) => {
        const idx = prev.indexOf(tabId);
        const next = prev.filter((id) => id !== tabId);
        if (next.length === 0) {
          setDrawerOpen(false);
          setActiveTab(null);
        } else {
          setActiveTab((current) => {
            if (current !== tabId) return current;
            return next[Math.min(idx, next.length - 1)];
          });
        }
        return next;
      });
    },
    [pinnedSet],
  );

  const resolveTabName = useCallback(
    (tabId: string): string => {
      if (tabId === DOMAINS_TAB_ID) return "Domains";
      if (tabId === OBSERVE_TAB_ID) return "Observe";
      if (!taxonomy) return "Loading\u2026";
      const skill = getSkillByUuid(taxonomy, tabId);
      return skill?.name ?? "Unknown Skill";
    },
    [taxonomy],
  );

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

  // Tabbed drawer content
  const tabItems: DrawerTab[] = showObservations
    ? openTabs.map((tabId) => ({
        id: tabId,
        label: resolveTabName(tabId),
        pinned: pinnedSet.has(tabId),
        closable: !pinnedSet.has(tabId),
      }))
    : [];

  const showTabbedDrawer = showObservations && openTabs.length > 0 && activeTab;
  const showSimpleDrawer = !showObservations && drawerOpen;

  function renderDrawerContent(tabId: string) {
    if (tabId === OBSERVE_TAB_ID) {
      return <DrawerObservationForm teacherStaffId={teacherStaffId} />;
    }
    if (tabId === DOMAINS_TAB_ID) {
      return (
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
      );
    }
    // Skill detail tab
    return (
      <SkillDetailContent skillId={tabId} teacherStaffId={teacherStaffId} />
    );
  }

  return (
    <div style={{ display: "flex", gap: 16 }}>
      <Stack gap="lg" style={{ flex: 1, minWidth: 0 }}>
        {/* Header: Title left, Ring right */}
        <Group justify="space-between" align="center" wrap="nowrap">
          <div style={{ flex: 1, minWidth: 0 }}>
            <Title order={2}>Active Skills</Title>
            <Text size="sm" c="dimmed">
              Your current focus and next steps
            </Text>
            {headerContent}
          </div>
          <SkillProgressRing taxonomy={taxonomy} statusMap={statusMap} />
        </Group>

        <Divider />

        <ActiveSkillsSummary teacherStaffId={teacherStaffId} />
      </Stack>

      {/* Tabbed drawer (observations mode) */}
      {showTabbedDrawer && (
        <>
          <div style={{ width: DETAIL_DRAWER_WIDTH, flexShrink: 0 }} />
          <DetailDrawer
            onClose={handleDrawerClose}
            showCloseButton={false}
            tabs={
              openTabs.length > 1
                ? {
                    items: tabItems,
                    activeId: activeTab,
                    onChange: setActiveTab,
                    onClose: handleTabClose,
                  }
                : undefined
            }
          >
            {renderDrawerContent(activeTab)}
          </DetailDrawer>
        </>
      )}

      {/* Simple drawer (default mode) */}
      {showSimpleDrawer && (
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
