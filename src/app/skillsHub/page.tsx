"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Center, Loader } from "@mantine/core";
import { useAuthenticatedUser } from "@/hooks/auth/useAuthenticatedUser";

export default function SkillsHubPage() {
  const router = useRouter();
  const { hasRole, metadata } = useAuthenticatedUser();

  const isSuperAdmin = hasRole("super_admin");
  const isDirector = hasRole("director");
  const isAdmin = isSuperAdmin || isDirector;
  const isCoach = hasRole("coach");

  useEffect(() => {
    if (isAdmin || isCoach) {
      router.replace("/skillsHub/caseload");
    } else if (metadata.staffId) {
      router.replace(`/skillsHub/teacher/${metadata.staffId}`);
    } else {
      router.replace("/skillsHub/skills");
    }
  }, [isAdmin, isCoach, metadata.staffId, router]);

  return (
    <Center h="50vh">
      <Loader />
    </Center>
  );
}
