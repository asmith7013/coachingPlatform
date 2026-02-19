"use client";

import { Stack, Text, Center, Group } from "@mantine/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DomainAccordion } from "./DomainAccordion";
import {
  ProgressionOverviewContent,
  SkillProgressRing,
} from "./ProgressStatsRow";
import { SkillDetailContent } from "./SkillDetailPanel";
import { DetailDrawer, DETAIL_DRAWER_WIDTH } from "../core/DetailDrawer";
import type { DrawerTab } from "../core/DetailDrawer";
import { useStatusLegend } from "../core/StatusLegendContext";
import { SkillMapSkeleton } from "../core/SkillsHubSkeletons";
import { useTaxonomy } from "../../hooks/useTaxonomy";
import { useTeacherSkillStatuses } from "../../hooks/useTeacherSkillStatuses";
import { useSkillProgressions } from "../../hooks/useSkillProgressions";
import { getSkillByUuid } from "../../core/taxonomy";
import type { TeacherSkillStatusDocument } from "../../core/skill-status.types";

const MAX_TABS = 3;
const PROGRESSION_TAB_ID = "__progression__";

interface SkillProgressionViewProps {
  teacherStaffId: string;
  teacherName?: string;
  pinnedSkillIds?: string[];
}

export function SkillProgressionView({
  teacherStaffId,
  teacherName,
  pinnedSkillIds = [],
}: SkillProgressionViewProps) {
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const { show, hide } = useStatusLegend();

  useEffect(() => {
    show();
    return () => hide();
  }, [show, hide]);

  const { taxonomy, loading: taxLoading, error: taxError } = useTaxonomy();
  const {
    statuses,
    loading: statusLoading,
    error: statusError,
  } = useTeacherSkillStatuses(teacherStaffId);
  const { plans } = useSkillProgressions(teacherStaffId);

  const hasOpenPlan = plans.some((p) => p.status === "open");

  const statusMap = useMemo(() => {
    const map = new Map<string, TeacherSkillStatusDocument>();
    for (const s of statuses) {
      map.set(s.skillId, s);
    }
    return map;
  }, [statuses]);

  // All pinned tab IDs (progression + any skill IDs from props)
  const allPinnedIds = useMemo(() => {
    const ids: string[] = [];
    if (hasOpenPlan) ids.push(PROGRESSION_TAB_ID);
    for (const id of pinnedSkillIds) {
      if (!ids.includes(id)) ids.push(id);
    }
    return ids;
  }, [hasOpenPlan, pinnedSkillIds]);

  const pinnedSet = useMemo(() => new Set(allPinnedIds), [allPinnedIds]);

  // Auto-open progression tab on page load when open plan exists
  useEffect(() => {
    if (!hasOpenPlan || openTabs.length > 0) return;
    setOpenTabs([PROGRESSION_TAB_ID]);
    setActiveTab(PROGRESSION_TAB_ID);
  }, [hasOpenPlan, openTabs.length]);

  // Ensure pinned skill IDs are in tabs
  useEffect(() => {
    if (pinnedSkillIds.length === 0) return;
    setOpenTabs((prev) => {
      const merged = [...prev];
      for (const id of pinnedSkillIds) {
        if (!merged.includes(id) && merged.length < MAX_TABS) {
          merged.push(id);
        }
      }
      if (
        merged.length === prev.length &&
        merged.every((id, i) => prev[i] === id)
      )
        return prev;
      return merged;
    });
  }, [pinnedSkillIds]);

  const handleSkillClick = useCallback(
    (skillId: string) => {
      setOpenTabs((prev) => {
        if (prev.includes(skillId)) {
          setActiveTab(skillId);
          return prev;
        }
        if (prev.length < MAX_TABS) {
          setActiveTab(skillId);
          return [...prev, skillId];
        }
        // At max — replace the active tab if it's not pinned
        setActiveTab((currentActive) => {
          const replaceId =
            currentActive && !pinnedSet.has(currentActive)
              ? currentActive
              : prev.findLast((id) => !pinnedSet.has(id));
          if (!replaceId) return currentActive;
          setOpenTabs((p) => p.map((id) => (id === replaceId ? skillId : id)));
          return skillId;
        });
        return prev;
      });
    },
    [pinnedSet],
  );

  const handleTabClose = useCallback(
    (tabId: string) => {
      if (pinnedSet.has(tabId)) return;
      setOpenTabs((prev) => {
        const idx = prev.indexOf(tabId);
        const next = prev.filter((id) => id !== tabId);
        setActiveTab((current) => {
          if (current !== tabId) return current;
          if (next.length === 0) return null;
          return next[Math.min(idx, next.length - 1)];
        });
        return next;
      });
    },
    [pinnedSet],
  );

  const handleInTabNavigate = useCallback((oldId: string, newId: string) => {
    setOpenTabs((prev) => prev.map((id) => (id === oldId ? newId : id)));
    setActiveTab(newId);
  }, []);

  const handleCloseAll = useCallback(() => {
    if (allPinnedIds.length > 0) {
      setOpenTabs([...allPinnedIds]);
      setActiveTab(allPinnedIds[0]);
    } else {
      setOpenTabs([]);
      setActiveTab(null);
    }
  }, [allPinnedIds]);

  const resolveTabName = useCallback(
    (tabId: string): string => {
      if (tabId === PROGRESSION_TAB_ID) return "Progression";
      if (!taxonomy) return "Loading…";
      const skill = getSkillByUuid(taxonomy, tabId);
      return skill?.name ?? "Unknown Skill";
    },
    [taxonomy],
  );

  // Compute which subDomains have active/developing skills to auto-expand
  const expandedSubDomainsByDomain = useMemo(() => {
    if (!taxonomy) return new Map<string, string[]>();

    const result = new Map<string, string[]>();
    for (const domain of taxonomy.domains) {
      const expanded = domain.subDomains
        .filter((sd) =>
          sd.skills.some((skill) => {
            const status = statusMap.get(skill.uuid)?.status;
            return status === "active";
          }),
        )
        .map((sd) => sd.id);
      if (expanded.length > 0) {
        result.set(domain.id, expanded);
      }
    }
    return result;
  }, [taxonomy, statusMap]);

  if (taxLoading || statusLoading) {
    return <SkillMapSkeleton />;
  }

  if (taxError || statusError) {
    return (
      <Center py="xl">
        <Text c="red">Error: {taxError || statusError}</Text>
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

  const domainsWithSkills = taxonomy.domains.filter((d) =>
    d.subDomains.some((sd) => sd.skills.length > 0),
  );

  // Build tab items for DetailDrawer
  const tabItems: DrawerTab[] = openTabs.map((tabId) => ({
    id: tabId,
    label: resolveTabName(tabId),
    pinned: pinnedSet.has(tabId),
  }));

  const showDrawer = openTabs.length > 0 && activeTab;

  return (
    <div style={{ display: "flex", gap: 16 }}>
      <Stack gap="lg" style={{ flex: 1, minWidth: 0 }}>
        <Group justify="space-between" align="center" wrap="nowrap">
          <div>
            <Text fw={700} size="lg">
              Skill Progression
            </Text>
            <Text size="sm" c="dimmed">
              Your progression across all domains
            </Text>
          </div>
          <SkillProgressRing taxonomy={taxonomy} statusMap={statusMap} />
        </Group>

        <DomainAccordion
          domains={domainsWithSkills}
          statusMap={statusMap}
          defaultExpandedSubDomainsByDomain={expandedSubDomainsByDomain}
          onSkillClick={handleSkillClick}
        />
      </Stack>

      {showDrawer && (
        <>
          <div style={{ width: DETAIL_DRAWER_WIDTH, flexShrink: 0 }} />
          <DetailDrawer
            onClose={handleCloseAll}
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
            {activeTab === PROGRESSION_TAB_ID ? (
              <ProgressionOverviewContent
                taxonomy={taxonomy}
                statusMap={statusMap}
                teacherStaffId={teacherStaffId}
                onSkillClick={handleSkillClick}
              />
            ) : (
              <SkillDetailContent
                skillId={activeTab}
                teacherStaffId={teacherStaffId}
                teacherName={teacherName}
                onSkillClick={(newId) => handleInTabNavigate(activeTab, newId)}
              />
            )}
          </DetailDrawer>
        </>
      )}
    </div>
  );
}
