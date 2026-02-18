import {
  TeacherSkillsIndexSchema,
  type TeacherSkillsIndex,
  type TeacherSkillFlat,
  type TeacherSkill,
  type SkillsByLevel,
} from "./taxonomy.types";

let cachedTaxonomy: TeacherSkillsIndex | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const MATHKCS_API_URL = process.env.MATHKCS_API_URL || "https://scm.podsie.org";

export async function fetchTaxonomy(): Promise<TeacherSkillsIndex> {
  if (cachedTaxonomy && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedTaxonomy;
  }

  const response = await fetch(
    `${MATHKCS_API_URL}/api/teacher-skills/index.json`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch taxonomy: ${response.statusText}`);
  }

  const data = await response.json();
  const validated = TeacherSkillsIndexSchema.parse(data);

  cachedTaxonomy = validated;
  cacheTimestamp = Date.now();

  return validated;
}

export function getSkillById(
  taxonomy: TeacherSkillsIndex,
  skillId: string,
): TeacherSkillFlat | null {
  for (const domain of taxonomy.domains) {
    for (const subDomain of domain.subDomains) {
      const skill = subDomain.skills.find((s) => s.id === skillId);
      if (skill) {
        return {
          ...skill,
          domainUuid: domain.uuid,
          domainId: domain.id,
          domainName: domain.name,
          subDomainUuid: subDomain.uuid,
          subDomainId: subDomain.id,
          subDomainName: subDomain.name,
        };
      }
    }
  }
  return null;
}

export function getSkillByUuid(
  taxonomy: TeacherSkillsIndex,
  uuid: string,
): TeacherSkillFlat | null {
  for (const domain of taxonomy.domains) {
    for (const subDomain of domain.subDomains) {
      const skill = subDomain.skills.find((s) => s.uuid === uuid);
      if (skill) {
        return {
          ...skill,
          domainUuid: domain.uuid,
          domainId: domain.id,
          domainName: domain.name,
          subDomainUuid: subDomain.uuid,
          subDomainId: subDomain.id,
          subDomainName: subDomain.name,
        };
      }
    }
  }
  return null;
}

export function groupSkillsByLevel(skills: TeacherSkill[]): SkillsByLevel {
  return {
    l1Skills: skills.filter((s) => s.level === 1),
    l2Skills: skills.filter((s) => s.level === 2),
  };
}

export function flattenSkills(
  taxonomy: TeacherSkillsIndex,
): TeacherSkillFlat[] {
  const skills: TeacherSkillFlat[] = [];
  for (const domain of taxonomy.domains) {
    for (const subDomain of domain.subDomains) {
      for (const skill of subDomain.skills) {
        skills.push({
          ...skill,
          domainUuid: domain.uuid,
          domainId: domain.id,
          domainName: domain.name,
          subDomainUuid: subDomain.uuid,
          subDomainId: subDomain.id,
          subDomainName: subDomain.name,
        });
      }
    }
  }
  return skills;
}
