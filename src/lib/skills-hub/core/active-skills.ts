import type { TeacherSkill, TeacherSkillsIndex } from "./taxonomy.types";
import type { TeacherSkillStatusDocument } from "./skill-status.types";

export interface ActiveSkillInfo {
  skill: TeacherSkill;
  domainName: string;
  subDomainName: string;
  subDomainSkills: TeacherSkill[];
}

/**
 * Collects all skills with "active" status from the taxonomy,
 * enriched with domain/subdomain context.
 */
export function collectActiveSkills(
  taxonomy: TeacherSkillsIndex,
  statusMap: Map<string, TeacherSkillStatusDocument>,
): ActiveSkillInfo[] {
  const active: ActiveSkillInfo[] = [];
  for (const domain of taxonomy.domains) {
    for (const subDomain of domain.subDomains) {
      for (const skill of subDomain.skills) {
        if (statusMap.get(skill.uuid)?.status === "active") {
          active.push({
            skill,
            domainName: domain.name,
            subDomainName: subDomain.name,
            subDomainSkills: subDomain.skills,
          });
        }
      }
    }
  }
  return active;
}
