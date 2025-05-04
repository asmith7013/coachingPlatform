"use client";

import { useState } from "react";
import { DashboardPage } from "@/components/composed/layouts";
import { PageHeader } from "@/components/composed/layouts";
import { useTeachingLabStaff } from "@/hooks";
import { PlusIcon } from "lucide-react";
import { StaffListComponent, StaffSearch } from "@components/domain/staff";
import { TablePagination } from "@/components/composed/tables/features/pagination";
import { TeachingLabStaff } from "@zod-schema/core/staff";

export default function TeachingLabStaffPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    staff, 
    loading, 
    error, 
    total, 
    page,
    setPage,
    limit,
    applyFilters
  } = useTeachingLabStaff({});

  const totalPages = Math.ceil((total || 0) / limit);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    applyFilters({ staffName: value });
  };

  return (
    <DashboardPage>
      <PageHeader 
        title="Teaching Lab Staff"
        subtitle="Browse and manage Teaching Lab staff members"
        actions={[
          {
            label: "Add Staff",
            icon: PlusIcon,
            onClick: () => {}, // This would be replaced with navigation or modal opening
            intent: "primary"
          }
        ]}
      />

      <div className="mb-6 flex gap-4 items-center">
        <StaffSearch
          value={searchTerm}
          onChange={handleSearch}
          className="flex-grow"
        />
      </div>

      {error && (
        <div className="p-4 text-red-500 bg-red-50 rounded-md mb-4">
          Error loading staff: {error.message}
        </div>
      )}

      <StaffListComponent 
        staffMembers={staff as TeachingLabStaff[]} 
        isLoading={loading} 
      />

      {total > 0 && (
        <div className="mt-6">
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </DashboardPage>
  );
} 