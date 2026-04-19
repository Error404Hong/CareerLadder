"use client"

import { Student } from "@/types/student"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const statusConfig: Record<number, { label: string; className: string }> = {
    1: { label: "Active", className: "bg-green-100 text-green-700 border border-green-200" },
    2: { label: "Disabled", className: "bg-red-100 text-red-600 border border-red-200" },
    3: { label: "Frozen", className: "bg-blue-100 text-blue-600 border border-blue-200" },
}

export const getStudentColumns = (
    onView: (id: string) => void
): ColumnDef<Student>[] => [
    {
        id: "name",
        header: ({ column }) => (
            <button
                className="text-sm font-medium text-left cursor-pointer flex items-center gap-1"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Name <ArrowUpDown size={12} />
            </button>
        ),
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        cell: ({ row }) => (
            <p className="text-sm font-medium text-[#0f172a]">
                {row.original.firstName} {row.original.lastName}
            </p>
        ),
    },
    {
        accessorKey: "email",
        header: () => <span className="text-sm font-medium">Email</span>,
        cell: ({ row }) => <span className="text-sm text-slate-500">{row.getValue("email")}</span>,
    },
    {
        accessorKey: "major",
        header: () => <span className="text-sm font-medium">Major</span>,
        cell: ({ row }) => <span className="text-sm text-slate-500">{row.getValue("major") || "—"}</span>,
    },
    {
        accessorKey: "location",
        header: () => <span className="text-sm font-medium">Location</span>,
        cell: ({ row }) => <span className="text-sm text-slate-500">{row.getValue("location") || "—"}</span>,
    },
    {
        accessorKey: "status",
        header: () => <span className="text-sm font-medium">Status</span>,
        cell: ({ row }) => {
            const status = Number(row.getValue("status"))
            const config = statusConfig[status] ?? { label: "Unknown", className: "bg-slate-100 text-slate-500 border border-slate-200" }
            return (
                <span className={`inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full ${config.className}`}>
                    {config.label}
                </span>
            )
        },
        filterFn: (row, _, filterValue) => {
            if (!filterValue || filterValue === "all") return true
            return String(row.getValue("status")) === String(filterValue)
        },
    },
    {
        accessorKey: "created_at",
        header: () => <span className="text-sm font-medium">Joined</span>,
        cell: ({ row }) => (
            <span className="text-sm text-slate-500">
                {new Date(row.getValue("created_at")).toLocaleDateString("en-MY", { year: "numeric", month: "short", day: "numeric" })}
            </span>
        ),
    },
    {
        id: "actions",
        header: () => <span className="text-sm font-medium">Actions</span>,
        cell: ({ row }) => (
            <Button
                variant="outline"
                size="sm"
                className="cursor-pointer text-xs h-7 px-3"
                onClick={() => onView(row.original.clerk_id)}
            >
                View
            </Button>
        ),
    },
]