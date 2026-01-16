"use client";

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Spinner } from "@/components/core/feedback/Spinner";
import {
  GRADE_OPTIONS,
  SCOPE_SEQUENCE_TAG_OPTIONS,
  type ScopeAndSequence,
  type ScopeAndSequenceInput,
} from "@zod-schema/scm/scope-and-sequence/scope-and-sequence";
import {
  useScopeSequenceList,
  useCreateScopeSequence,
  useUpdateScopeSequence,
  useDeleteScopeSequence,
} from "@/hooks/scm";
import { AddEntryModal, EditEntryModal, DeleteConfirmModal } from "./components";

export default function ScopeAndSequencePage() {
  // Filter state
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [unitFilter, setUnitFilter] = useState<number | undefined>(undefined);

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScopeAndSequence | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<ScopeAndSequence | null>(null);

  // Table state
  const [sorting, setSorting] = useState<SortingState>([
    { id: "unitNumber", desc: false },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Data fetching
  const { data, isLoading, refetch } = useScopeSequenceList({
    grade: selectedGrade || undefined,
    unitNumber: unitFilter,
    limit: 500,
  });

  // Mutations
  const createMutation = useCreateScopeSequence();
  const updateMutation = useUpdateScopeSequence();
  const deleteMutation = useDeleteScopeSequence();

  // Get unique unit numbers for dropdown
  const unitOptions = useMemo(() => {
    if (!data) return [];
    const units = [...new Set(data.map((entry: ScopeAndSequence) => entry.unitNumber))];
    return units.sort((a, b) => a - b);
  }, [data]);

  // Filter data by tag client-side (since backend doesn't filter by tag in basic fetch)
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!selectedTag) return data;
    return data.filter((entry: ScopeAndSequence) => entry.scopeSequenceTag === selectedTag);
  }, [data, selectedTag]);

  // Table columns
  const columns = useMemo<ColumnDef<ScopeAndSequence>[]>(
    () => [
      {
        accessorKey: "grade",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting()}
            className="flex items-center gap-1 font-semibold cursor-pointer"
          >
            Grade
            {column.getIsSorted() === "asc" ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : null}
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {row.original.grade === "Algebra 1" ? "Alg 1" : `G${row.original.grade}`}
          </span>
        ),
      },
      {
        accessorKey: "unitNumber",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting()}
            className="flex items-center gap-1 font-semibold cursor-pointer"
          >
            Unit
            {column.getIsSorted() === "asc" ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : null}
          </button>
        ),
        cell: ({ row }) => <span className="text-sm">U{row.original.unitNumber}</span>,
      },
      {
        accessorKey: "unitLessonId",
        header: "ID",
        cell: ({ row }) => (
          <span className="text-sm font-mono bg-gray-100 px-1 rounded">
            {row.original.unitLessonId}
          </span>
        ),
      },
      {
        accessorKey: "lessonName",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting()}
            className="flex items-center gap-1 font-semibold cursor-pointer"
          >
            Lesson Name
            {column.getIsSorted() === "asc" ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : null}
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-sm max-w-xs truncate block" title={row.original.lessonName}>
            {row.original.lessonName}
          </span>
        ),
      },
      {
        accessorKey: "lessonType",
        header: "Type",
        cell: ({ row }) => {
          const type = row.original.lessonType;
          if (!type) return <span className="text-gray-400">-</span>;
          const colors = {
            lesson: "bg-blue-100 text-blue-800",
            rampUp: "bg-amber-100 text-amber-800",
            assessment: "bg-purple-100 text-purple-800",
          };
          const labels = {
            lesson: "Lesson",
            rampUp: "Ramp Up",
            assessment: "Assessment",
          };
          return (
            <span className={`text-xs px-2 py-0.5 rounded ${colors[type]}`}>
              {labels[type]}
            </span>
          );
        },
      },
      {
        accessorKey: "section",
        header: "Section",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.section || <span className="text-gray-400">-</span>}
          </span>
        ),
      },
      {
        accessorKey: "scopeSequenceTag",
        header: "Scope & Sequence Tag",
        cell: ({ row }) => (
          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
            {row.original.scopeSequenceTag || <span className="text-gray-400">-</span>}
          </span>
        ),
      },
      {
        accessorKey: "standards",
        header: "Standards",
        cell: ({ row }) => {
          const count = row.original.standards?.length || 0;
          return (
            <span className="text-sm text-gray-600">
              {count > 0 ? `${count} std` : "-"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditingEntry(row.original)}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
              title="Edit"
            >
              <PencilSquareIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDeletingEntry(row.original)}
              className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
              title="Delete"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  });

  // Handlers
  const handleCreate = async (data: ScopeAndSequenceInput) => {
    await createMutation.mutateAsync(data);
    setIsAddModalOpen(false);
  };

  const handleUpdate = async (data: ScopeAndSequenceInput) => {
    if (!editingEntry?._id) return;
    await updateMutation.mutateAsync({ id: editingEntry._id, data });
    setEditingEntry(null);
  };

  const handleDelete = async () => {
    if (!deletingEntry?._id) return;
    await deleteMutation.mutateAsync(deletingEntry._id);
    setDeletingEntry(null);
  };

  return (
    <div className="mx-auto p-6" style={{ maxWidth: "1600px" }}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scope & Sequence</h1>
            <p className="text-gray-600 text-sm">
              Manage curriculum scope and sequence entries
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            <PlusIcon className="h-5 w-5" />
            Add Entry
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Grade Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Grade</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm cursor-pointer min-w-[120px]"
            >
              <option value="">All Grades</option>
              {GRADE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g === "Algebra 1" ? "Algebra 1" : `Grade ${g}`}
                </option>
              ))}
            </select>
          </div>

          {/* Tag Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tag</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm cursor-pointer min-w-[120px]"
            >
              <option value="">All Tags</option>
              {SCOPE_SEQUENCE_TAG_OPTIONS.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Unit</label>
            <select
              value={unitFilter ?? ""}
              onChange={(e) => setUnitFilter(e.target.value ? parseInt(e.target.value) : undefined)}
              className="px-3 py-2 border rounded-lg text-sm cursor-pointer min-w-[100px]"
            >
              <option value="">All Units</option>
              {unitOptions.map((unit) => (
                <option key={unit} value={unit}>
                  Unit {unit}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search lessons..."
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          {/* Refresh */}
          <div className="self-end">
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="px-3 py-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
              title="Refresh"
            >
              <ArrowPathIcon className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="md" variant="primary" />
            <span className="ml-2 text-gray-500">Loading entries...</span>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No entries found.</p>
            <p className="text-sm mt-1">Try adjusting your filters or add a new entry.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <div className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    filteredData.length
                  )}
                </span>{" "}
                of <span className="font-medium">{filteredData.length}</span> entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <span className="text-sm">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <AddEntryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
        defaultTag={selectedTag || undefined}
        defaultGrade={selectedGrade || undefined}
        defaultUnit={unitFilter}
        existingEntries={data || []}
      />

      <EditEntryModal
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        onSubmit={handleUpdate}
        entry={editingEntry}
        isLoading={updateMutation.isPending}
      />

      <DeleteConfirmModal
        isOpen={!!deletingEntry}
        onClose={() => setDeletingEntry(null)}
        onConfirm={handleDelete}
        entry={deletingEntry}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
