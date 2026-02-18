"use client";

import { Group, Stack, Text, Center, Anchor } from "@mantine/core";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DomainAccordion } from "./DomainAccordion";
import { ProgressStatsRow } from "./ProgressStatsRow";
import { SkillDetailPanel } from "./SkillDetailPanel";
import { useStatusLegend } from "../core/StatusLegendContext";
import { SkillMapSkeleton } from "../core/SkillsHubSkeletons";
import { useTaxonomy } from "../../hooks/useTaxonomy";
import { useTeacherSkillStatuses } from "../../hooks/useTeacherSkillStatuses";
import type { TeacherSkillStatusDocument } from "../../core/skill-status.types";

interface SkillProgressionViewProps {
  teacherStaffId: string;
  teacherName?: string;
}

export function SkillProgressionView({
  teacherStaffId,
  teacherName,
}: SkillProgressionViewProps) {
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
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

  const statusMap = useMemo(() => {
    const map = new Map<string, TeacherSkillStatusDocument>();
    for (const s of statuses) {
      map.set(s.skillId, s);
    }
    return map;
  }, [statuses]);

  // Compute which subDomains have active/developing skills to auto-expand
  const expandedSubDomainsByDomain = useMemo(() => {
    if (!taxonomy) return new Map<string, string[]>();

    const result = new Map<string, string[]>();
    for (const domain of taxonomy.domains) {
      const expanded = domain.subDomains
        .filter((sd) =>
          sd.skills.some((skill) => {
            const status = statusMap.get(skill.uuid)?.status;
            return status === "active" || status === "developing";
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

  return (
    <div style={{ display: "flex", gap: 16 }}>
      <Stack gap="lg" style={{ flex: 1, minWidth: 0 }}>
        <ProgressStatsRow taxonomy={taxonomy} statusMap={statusMap} />

        <Group justify="space-between" align="baseline">
          <Text fw={700} size="lg">
            Skill Progression
          </Text>
          <Anchor component={Link} href="/skillsHub/skills" size="sm">
            View all skills
          </Anchor>
        </Group>

        <DomainAccordion
          domains={domainsWithSkills}
          statusMap={statusMap}
          defaultExpandedSubDomainsByDomain={expandedSubDomainsByDomain}
          onSkillClick={setSelectedSkillId}
        />
      </Stack>

      {selectedSkillId && (
        <SkillDetailPanel
          skillId={selectedSkillId}
          teacherStaffId={teacherStaffId}
          teacherName={teacherName}
          onSkillClick={setSelectedSkillId}
          onClose={() => setSelectedSkillId(null)}
        />
      )}
    </div>
  );
}
