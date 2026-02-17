import React, { useMemo } from "react";
import { Visit } from "@zod-schema/visits/visit";
import { School } from "@zod-schema/core/school";
import { SchoolVisitsGroup } from "./SchoolVisitsGroup";
import { EmptyListWrapper } from "@/components/core/empty/EmptyListWrapper";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

interface VisitsStatusGridProps {
  visits: Visit[];
  schools: School[];
  isLoading: boolean;
  statusFilter: "all" | "complete" | "incomplete";
  searchTerm: string;
}

export function VisitsStatusGrid({
  visits,
  schools,
  isLoading,
  statusFilter,
  searchTerm,
}: VisitsStatusGridProps) {
  // Group visits by school with filtering
  const groupedVisits = useMemo(() => {
    // Filter visits based on status
    let filteredVisits = visits;
    if (statusFilter === "complete") {
      filteredVisits = visits.filter((v) => v.coachingLogSubmitted === true);
    } else if (statusFilter === "incomplete") {
      filteredVisits = visits.filter((v) => v.coachingLogSubmitted === false);
    }

    // Group by school
    const grouped = filteredVisits.reduce(
      (acc, visit) => {
        const schoolId = visit.schoolId;
        if (!acc[schoolId]) {
          acc[schoolId] = [];
        }
        acc[schoolId].push(visit);
        return acc;
      },
      {} as Record<string, Visit[]>,
    );

    // Filter schools by search term and only include schools with visits
    const schoolsWithVisits = schools
      .filter((school) => {
        const hasVisits = grouped[school._id]?.length > 0;
        const matchesSearch =
          searchTerm === "" ||
          school.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          school.district.toLowerCase().includes(searchTerm.toLowerCase());
        return hasVisits && matchesSearch;
      })
      .map((school) => ({
        school,
        visits: grouped[school._id] || [],
      }))
      .sort((a, b) => a.school.schoolName.localeCompare(b.school.schoolName));

    return schoolsWithVisits;
  }, [visits, schools, statusFilter, searchTerm]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <EmptyListWrapper
      items={groupedVisits}
      resourceName="visits"
      title="No visits found"
      description="No visits match your current filters"
      icon={CalendarDaysIcon}
    >
      <div className="space-y-6">
        {groupedVisits.map(({ school, visits: schoolVisits }) => (
          <SchoolVisitsGroup
            key={school._id}
            school={school}
            visits={schoolVisits}
          />
        ))}
      </div>
    </EmptyListWrapper>
  );
}
