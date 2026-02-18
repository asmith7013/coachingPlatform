"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Stack,
  Button,
  Group,
  Center,
  Loader,
  Text,
  Table,
  Badge,
  Textarea,
  Select,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ObservationHeader } from "./ObservationHeader";
import { useTaxonomy } from "../_hooks/useTaxonomy";
import { useTeacherSkillStatuses } from "../_hooks/useTeacherSkillStatuses";
import { createObservation } from "../_actions/observation.actions";
import type { RatingScale, ObservationType } from "../_types/observation.types";
import type { TeacherSkillSubDomain } from "../_types/taxonomy.types";

const DOMAIN_COLORS: Array<{ bg: string; c: string }> = [
  { bg: "yellow.0", c: "yellow.9" },
  { bg: "green.0", c: "green.9" },
  { bg: "blue.0", c: "blue.9" },
  { bg: "violet.0", c: "violet.9" },
  { bg: "teal.0", c: "teal.9" },
  { bg: "orange.0", c: "orange.9" },
];

const RATING_OPTIONS = [
  { value: "not_observed", label: "Not Observed" },
  { value: "partial", label: "Partial" },
  { value: "mostly", label: "Mostly" },
  { value: "fully", label: "Fully" },
];

interface ObservationGuideProps {
  teacherStaffId: string;
}

export function ObservationGuide({ teacherStaffId }: ObservationGuideProps) {
  const router = useRouter();
  const { taxonomy, loading: taxLoading } = useTaxonomy();
  const { statuses, loading: statusLoading } =
    useTeacherSkillStatuses(teacherStaffId);

  const [date, setDate] = useState<string | null>(
    new Date().toISOString().split("T")[0],
  );
  const [observationType, setObservationType] =
    useState<ObservationType | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(
    new Set(),
  );

  const [skillRatings, setSkillRatings] = useState<
    Map<string, { rating: RatingScale | null; evidence: string }>
  >(new Map());
  const [domainRatings, setDomainRatings] = useState<
    Map<string, { rating: RatingScale | null; evidence: string }>
  >(new Map());

  const activeSkillIds = useMemo(
    () =>
      new Set(
        statuses.filter((s) => s.status === "active").map((s) => s.skillId),
      ),
    [statuses],
  );

  const toggleDomain = (domainId: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domainId)) next.delete(domainId);
      else next.add(domainId);
      return next;
    });
  };

  // Apply the same rating to every skill in the sub-domain
  const handleSubDomainRating = (
    subDomain: TeacherSkillSubDomain,
    rating: RatingScale | null,
  ) => {
    setSkillRatings((prev) => {
      const next = new Map(prev);
      subDomain.skills.forEach((skill) => {
        const existing = next.get(skill.id) || { rating: null, evidence: "" };
        next.set(skill.id, { ...existing, rating });
      });
      return next;
    });
  };

  // Apply the same evidence to every skill in the sub-domain
  const handleSubDomainEvidence = (
    subDomain: TeacherSkillSubDomain,
    evidence: string,
  ) => {
    setSkillRatings((prev) => {
      const next = new Map(prev);
      subDomain.skills.forEach((skill) => {
        const existing = next.get(skill.id) || { rating: null, evidence: "" };
        next.set(skill.id, { ...existing, evidence });
      });
      return next;
    });
  };

  // Representative rating/evidence for display comes from first skill in sub-domain
  const getSubDomainRating = (
    subDomain: TeacherSkillSubDomain,
  ): RatingScale | null => {
    const first = subDomain.skills[0];
    return first ? (skillRatings.get(first.id)?.rating ?? null) : null;
  };

  const getSubDomainEvidence = (subDomain: TeacherSkillSubDomain): string => {
    const first = subDomain.skills[0];
    return first ? (skillRatings.get(first.id)?.evidence ?? "") : "";
  };

  const handleDomainRating = (
    domainId: string,
    rating: RatingScale | null,
  ) => {
    setDomainRatings((prev) => {
      const next = new Map(prev);
      const existing = next.get(domainId) || { rating: null, evidence: "" };
      next.set(domainId, { ...existing, rating });
      return next;
    });
  };

  const handleDomainEvidence = (domainId: string, evidence: string) => {
    setDomainRatings((prev) => {
      const next = new Map(prev);
      const existing = next.get(domainId) || { rating: null, evidence: "" };
      next.set(domainId, { ...existing, evidence });
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!date) {
      notifications.show({
        title: "Validation",
        message: "Date is required",
        color: "red",
      });
      return;
    }

    const ratedSkills = Array.from(skillRatings.entries())
      .filter(([, v]) => v.rating && v.rating !== "not_observed")
      .map(([skillId, v]) => ({
        skillId,
        rating: v.rating!,
        evidence: v.evidence || null,
      }));

    if (ratedSkills.length === 0) {
      notifications.show({
        title: "Validation",
        message: "Rate at least one look-for before submitting",
        color: "red",
      });
      return;
    }

    const ratedDomains = Array.from(domainRatings.entries())
      .filter(([, v]) => v.rating)
      .map(([domainId, v]) => ({
        domainId,
        overallRating: v.rating,
        evidence: v.evidence || null,
      }));

    setSubmitting(true);

    const result = await createObservation({
      teacherStaffId,
      date: new Date(date).toISOString(),
      type: observationType,
      notes: notes || null,
      ratings: ratedSkills,
      domainRatings: ratedDomains,
    });

    setSubmitting(false);

    if (result.success) {
      notifications.show({
        title: "Success",
        message: "Observation recorded",
        color: "teal",
      });
      router.push(`/skillsHub/teacher/${teacherStaffId}`);
    } else {
      notifications.show({
        title: "Error",
        message: result.error || "Failed to save observation",
        color: "red",
      });
    }
  };

  if (taxLoading || statusLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (!taxonomy) {
    return (
      <Center py="xl">
        <Text c="dimmed">No taxonomy data</Text>
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <ObservationHeader
        date={date}
        observationType={observationType}
        notes={notes}
        onDateChange={setDate}
        onTypeChange={setObservationType}
        onNotesChange={setNotes}
      />

      <div style={{ overflowX: "auto" }}>
        <Table
          withTableBorder
          withColumnBorders
          style={{ tableLayout: "fixed", minWidth: 900 }}
        >
          <colgroup>
            <col style={{ width: "13%" }} />
            <col style={{ width: "32%" }} />
            <col style={{ width: "22%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "17%" }} />
          </colgroup>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Domain</Table.Th>
              <Table.Th>Teacher Look Fors</Table.Th>
              <Table.Th>Evidence</Table.Th>
              <Table.Th>Rating</Table.Th>
              <Table.Th>Overall Rating + Evidence</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {taxonomy.domains.flatMap((domain, domainIdx) => {
              const color = DOMAIN_COLORS[domainIdx % DOMAIN_COLORS.length];
              const isExpanded = expandedDomains.has(domain.id);

              const activeSubDomains = domain.subDomains.filter((sd) =>
                sd.skills.some((s) => activeSkillIds.has(s.id)),
              );
              const otherSubDomains = domain.subDomains.filter(
                (sd) => !sd.skills.some((s) => activeSkillIds.has(s.id)),
              );

              const visibleSubDomains = isExpanded
                ? domain.subDomains
                : activeSubDomains.length > 0
                  ? activeSubDomains
                  : domain.subDomains.slice(0, 1);

              const hasShowMore =
                !isExpanded &&
                otherSubDomains.length > 0 &&
                activeSubDomains.length > 0;
              const showCollapse = isExpanded && otherSubDomains.length > 0;

              const totalRowSpan =
                visibleSubDomains.length +
                (hasShowMore ? 1 : 0) +
                (showCollapse ? 1 : 0);

              const domainRating = domainRatings.get(domain.id) ?? {
                rating: null,
                evidence: "",
              };

              const rows: React.ReactNode[] = visibleSubDomains.map(
                (subDomain, subIdx) => {
                  const subRating = getSubDomainRating(subDomain);
                  const subEvidence = getSubDomainEvidence(subDomain);
                  const hasFocus = subDomain.skills.some((s) =>
                    activeSkillIds.has(s.id),
                  );

                  return (
                    <Table.Tr key={subDomain.id}>
                      {subIdx === 0 && (
                        <Table.Td
                          rowSpan={totalRowSpan}
                          bg={color.bg}
                          style={{ verticalAlign: "top", paddingTop: 10 }}
                        >
                          <Text
                            fw={700}
                            size="sm"
                            c={color.c}
                            style={{ lineHeight: 1.3 }}
                          >
                            {domain.name}
                          </Text>
                          {activeSubDomains.length > 0 && (
                            <Badge
                              size="xs"
                              variant="light"
                              color="blue"
                              mt={6}
                            >
                              {activeSubDomains.length} focus
                            </Badge>
                          )}
                        </Table.Td>
                      )}

                      <Table.Td style={{ verticalAlign: "top" }}>
                        <Group gap="xs" mb={4} wrap="nowrap">
                          <Text size="sm" fw={600}>
                            {subDomain.name}
                          </Text>
                          {hasFocus && (
                            <Badge size="xs" color="blue" variant="light">
                              Focus
                            </Badge>
                          )}
                        </Group>
                        <ul
                          style={{
                            paddingLeft: 16,
                            margin: 0,
                            listStyle: "disc",
                          }}
                        >
                          {subDomain.skills.map((skill) => (
                            <li key={skill.id}>
                              <Text
                                size="xs"
                                c="dimmed"
                                style={{ lineHeight: 1.4 }}
                              >
                                {skill.name}
                                {skill.description
                                  ? ` — ${skill.description}`
                                  : ""}
                              </Text>
                            </li>
                          ))}
                        </ul>
                      </Table.Td>

                      <Table.Td style={{ verticalAlign: "top" }}>
                        <Textarea
                          placeholder="Evidence..."
                          size="xs"
                          autosize
                          minRows={3}
                          value={subEvidence}
                          onChange={(e) =>
                            handleSubDomainEvidence(
                              subDomain,
                              e.currentTarget.value,
                            )
                          }
                        />
                      </Table.Td>

                      <Table.Td style={{ verticalAlign: "top" }}>
                        <Select
                          size="xs"
                          placeholder="Select..."
                          data={RATING_OPTIONS}
                          value={subRating}
                          onChange={(val) =>
                            handleSubDomainRating(
                              subDomain,
                              (val as RatingScale) || null,
                            )
                          }
                          clearable
                        />
                      </Table.Td>

                      {subIdx === 0 && (
                        <Table.Td
                          rowSpan={totalRowSpan}
                          style={{ verticalAlign: "top" }}
                        >
                          <Stack gap="xs">
                            <Select
                              size="xs"
                              placeholder="Overall rating..."
                              data={RATING_OPTIONS}
                              value={domainRating.rating}
                              onChange={(val) =>
                                handleDomainRating(
                                  domain.id,
                                  (val as RatingScale) || null,
                                )
                              }
                              clearable
                            />
                            {domainRating.rating &&
                              domainRating.rating !== "not_observed" && (
                                <Textarea
                                  placeholder="Overall evidence..."
                                  size="xs"
                                  autosize
                                  minRows={2}
                                  value={domainRating.evidence}
                                  onChange={(e) =>
                                    handleDomainEvidence(
                                      domain.id,
                                      e.currentTarget.value,
                                    )
                                  }
                                />
                              )}
                          </Stack>
                        </Table.Td>
                      )}
                    </Table.Tr>
                  );
                },
              );

              if (hasShowMore) {
                rows.push(
                  <Table.Tr key={`${domain.id}-show-more`}>
                    <Table.Td colSpan={3} ta="center" py="xs">
                      <Button
                        variant="subtle"
                        size="xs"
                        onClick={() => toggleDomain(domain.id)}
                      >
                        Show {otherSubDomains.length} more look-fors
                      </Button>
                    </Table.Td>
                  </Table.Tr>,
                );
              }

              if (showCollapse) {
                rows.push(
                  <Table.Tr key={`${domain.id}-collapse`}>
                    <Table.Td colSpan={3} ta="center" py="xs">
                      <Button
                        variant="subtle"
                        size="xs"
                        color="gray"
                        onClick={() => toggleDomain(domain.id)}
                      >
                        Show less
                      </Button>
                    </Table.Td>
                  </Table.Tr>,
                );
              }

              return rows;
            })}
          </Table.Tbody>
        </Table>
      </div>

      <Group justify="flex-end">
        <Button
          variant="default"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={submitting}>
          Save Observation
        </Button>
      </Group>
    </Stack>
  );
}
