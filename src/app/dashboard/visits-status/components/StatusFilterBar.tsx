import React from "react";
import { Button } from "@/components/core/Button";
import { Input } from "@/components/core/fields/Input";

interface StatusFilterBarProps {
  statusFilter: "all" | "complete" | "incomplete";
  setStatusFilter: (filter: "all" | "complete" | "incomplete") => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function StatusFilterBar({
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm,
}: StatusFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Status Filter Buttons */}
      <div className="flex gap-2">
        <Button
          intent={statusFilter === "all" ? "primary" : "secondary"}
          appearance={statusFilter === "all" ? "solid" : "outline"}
          onClick={() => setStatusFilter("all")}
        >
          All Visits
        </Button>
        <Button
          intent={statusFilter === "complete" ? "primary" : "secondary"}
          appearance={statusFilter === "complete" ? "solid" : "outline"}
          onClick={() => setStatusFilter("complete")}
        >
          Complete
        </Button>
        <Button
          intent={statusFilter === "incomplete" ? "primary" : "secondary"}
          appearance={statusFilter === "incomplete" ? "solid" : "outline"}
          onClick={() => setStatusFilter("incomplete")}
        >
          Pending
        </Button>
      </div>

      {/* Search Input */}
      <div className="flex-1 max-w-md">
        <Input
          type="text"
          placeholder="Search schools..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  );
}
