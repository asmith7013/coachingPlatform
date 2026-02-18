import { z } from "zod";

export const TeacherSkillSchema = z.object({
  uuid: z.string().uuid(),
  id: z.string(),
  name: z.string(),
  description: z.string(),
  level: z.union([z.literal(1), z.literal(2)]),
  pairedSkillId: z.string().nullable(),
});

export const TeacherSkillSubDomainSchema = z.object({
  uuid: z.string().uuid(),
  id: z.string(),
  name: z.string(),
  skills: z.array(TeacherSkillSchema),
});

export const TeacherSkillDomainSchema = z.object({
  uuid: z.string().uuid(),
  id: z.string(),
  name: z.string(),
  subDomains: z.array(TeacherSkillSubDomainSchema),
});

export const TeacherSkillsIndexSchema = z.object({
  source: z.string(),
  description: z.string(),
  domains: z.array(TeacherSkillDomainSchema),
});

export type TeacherSkill = z.infer<typeof TeacherSkillSchema>;
export type TeacherSkillSubDomain = z.infer<typeof TeacherSkillSubDomainSchema>;
export type TeacherSkillDomain = z.infer<typeof TeacherSkillDomainSchema>;
export type TeacherSkillsIndex = z.infer<typeof TeacherSkillsIndexSchema>;

export type TeacherSkillFlat = TeacherSkill & {
  domainUuid: string;
  domainId: string;
  domainName: string;
  subDomainUuid: string;
  subDomainId: string;
  subDomainName: string;
};
