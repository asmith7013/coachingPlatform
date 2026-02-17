"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { TanStackTable } from "@/components/composed/tables/tanstack/TanStackTable";
import { TableCell } from "@/components/composed/tables/parts/cell";

interface Student {
  id: string;
  name: string;
  grade: number;
  subject: string;
  score: number;
  status: "completed" | "in-progress" | "not-started";
}

const sampleData: Student[] = [
  {
    id: "1",
    name: "Alice Johnson",
    grade: 5,
    subject: "Math",
    score: 95,
    status: "completed",
  },
  {
    id: "2",
    name: "Bob Smith",
    grade: 4,
    subject: "Reading",
    score: 87,
    status: "completed",
  },
  {
    id: "3",
    name: "Carol Davis",
    grade: 5,
    subject: "Math",
    score: 0,
    status: "in-progress",
  },
];

const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "name",
    header: "Student Name",
    cell: ({ getValue }) => (
      <TableCell variant="default">
        <span className="font-medium">{String(getValue())}</span>
      </TableCell>
    ),
  },
  {
    accessorKey: "grade",
    header: "Grade",
    cell: ({ getValue }) => (
      <TableCell variant="muted">Grade {String(getValue())}</TableCell>
    ),
  },
];

export default function SimpleTanStackTablePage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Simple TanStack Table</h1>
      <TanStackTable
        data={sampleData}
        columns={columns}
        searchable
        paginated
        pageSize={2}
      />
    </div>
  );
}
