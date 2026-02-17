"use client";

import { Card, Text, Badge, Group, Accordion, Stack } from "@mantine/core";
import { SkillRatingRow } from "./SkillRatingRow";
import { DomainOverallRating } from "./DomainOverallRating";
import type {
  TeacherSkillDomain,
  TeacherSkillFlat,
} from "../_types/taxonomy.types";
import type { RatingScale } from "../_types/observation.types";

interface DomainRubricSectionProps {
  domain: TeacherSkillDomain;
  activeSkillIds: Set<string>;
  skillRatings: Map<string, { rating: RatingScale | null; evidence: string }>;
  domainRating: { rating: RatingScale | null; evidence: string };
  onSkillRatingChange: (skillId: string, rating: RatingScale | null) => void;
  onSkillEvidenceChange: (skillId: string, evidence: string) => void;
  onDomainRatingChange: (domainId: string, rating: RatingScale | null) => void;
  onDomainEvidenceChange: (domainId: string, evidence: string) => void;
}

export function DomainRubricSection({
  domain,
  activeSkillIds,
  skillRatings,
  domainRating,
  onSkillRatingChange,
  onSkillEvidenceChange,
  onDomainRatingChange,
  onDomainEvidenceChange,
}: DomainRubricSectionProps) {
  const allSkills: TeacherSkillFlat[] = domain.subDomains.flatMap((sd) =>
    sd.skills.map((s) => ({
      ...s,
      domainId: domain.id,
      domainName: domain.name,
      subDomainId: sd.id,
      subDomainName: sd.name,
    })),
  );

  const activeSkills = allSkills.filter((s) => activeSkillIds.has(s.id));
  const otherSkills = allSkills.filter((s) => !activeSkillIds.has(s.id));

  if (activeSkills.length === 0 && otherSkills.length === 0) return null;

  return (
    <Card shadow="sm" withBorder>
      <Card.Section withBorder inheritPadding py="sm">
        <Group>
          <Text fw={700}>{domain.name}</Text>
          <Badge size="sm" variant="light" color="blue">
            {activeSkills.length} focus
          </Badge>
        </Group>
      </Card.Section>

      <Stack gap={0} mt="sm">
        {activeSkills.map((skill) => {
          const data = skillRatings.get(skill.id) || {
            rating: null,
            evidence: "",
          };
          return (
            <SkillRatingRow
              key={skill.id}
              skillId={skill.id}
              skillName={skill.name}
              skillDescription={skill.description}
              rating={data.rating}
              evidence={data.evidence}
              onRatingChange={onSkillRatingChange}
              onEvidenceChange={onSkillEvidenceChange}
            />
          );
        })}
      </Stack>

      {otherSkills.length > 0 && (
        <Accordion variant="default" mt="sm">
          <Accordion.Item value="more">
            <Accordion.Control>
              <Text size="sm" c="dimmed">
                Show {otherSkills.length} more skills
              </Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap={0}>
                {otherSkills.map((skill) => {
                  const data = skillRatings.get(skill.id) || {
                    rating: null,
                    evidence: "",
                  };
                  return (
                    <SkillRatingRow
                      key={skill.id}
                      skillId={skill.id}
                      skillName={skill.name}
                      skillDescription={skill.description}
                      rating={data.rating}
                      evidence={data.evidence}
                      onRatingChange={onSkillRatingChange}
                      onEvidenceChange={onSkillEvidenceChange}
                    />
                  );
                })}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}

      <DomainOverallRating
        domainId={domain.id}
        domainName={domain.name}
        rating={domainRating.rating}
        evidence={domainRating.evidence}
        onRatingChange={onDomainRatingChange}
        onEvidenceChange={onDomainEvidenceChange}
      />
    </Card>
  );
}
