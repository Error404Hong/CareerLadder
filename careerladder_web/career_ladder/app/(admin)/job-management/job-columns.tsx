"use client"

import { Job } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const statusConfig: Record<string, { label: string; className: string }> = {
    open: { label: "Open", className: "bg-green-100 text-green-700 border border-green-200" },
    closed: { label: "Closed", className: "bg-red-100 text-red-600 border border-red-200" },
}

export const getJobColumns = (onView: (id: string) => void, onDelete: (job: Job) => void): ColumnDef<Job>[] => [
    {
        accessorKey: "title",
        header: ({ column }) => (
            <button
                className="text-sm font-medium text-left cursor-pointer flex items-center gap-1"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Title <ArrowUpDown size={12} />
            </button>
        ),
        cell: ({ row }) => <p className="text-sm font-medium text-[#0f172a]">{row.getValue("title")}</p>
    },
    {
        accessorKey: "employment_type",
        header: () => <span className="text-sm font-medium">Type</span>,
        cell: ({ row }) => (
            <span className="text-sm text-slate-500 capitalize">{row.getValue("employment_type")}</span>
        )
    },
    {
        accessorKey: "location",
        header: () => <span className="text-sm font-medium">Location</span>,
        cell: ({ row }) => {
            const location = row.getValue("location") as string
            const isRemote = row.original.is_remote
            return (
                <span className="text-sm text-slate-500">
                    {isRemote ? "Remote" : location || "—"}
                </span>
            )
        }
    },
    {
        id: "salary",
        header: () => <span className="text-sm font-medium">Salary (RM)</span>,
        cell: ({ row }) => (
            <span className="text-sm text-slate-500">
                {Number(row.original.salary_min).toLocaleString()} — {Number(row.original.salary_max).toLocaleString()}
            </span>
        )
    },
    {
        accessorKey: "status",
        header: () => <span className="text-sm font-medium">Status</span>,
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            const config = statusConfig[status] ?? { label: status, className: "bg-slate-100 text-slate-500 border border-slate-200" }
            return (
                <span className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${config.className}`}>
                    {config.label}
                </span>
            )
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true
            return row.getValue(columnId) === filterValue
        }
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => (
            <button
                className="text-sm font-medium text-left cursor-pointer flex items-center gap-1"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Posted <ArrowUpDown size={12} />
            </button>
        ),
        cell: ({ row }) => (
            <span className="text-sm text-slate-400">
                {new Date(row.getValue("created_at")).toLocaleDateString("en-MY", { year: "numeric", month: "short", day: "numeric" })}
            </span>
        )
    },
    {
        id: "actions",
        header: () => <span className="text-sm font-medium">Actions</span>,
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    className="h-8 text-xs cursor-pointer"
                    onClick={() => onView(row.original.id)}
                >
                    View
                </Button>
                <Button
                    size="sm"
                    className="h-8 text-xs cursor-pointer bg-red-500 hover:bg-red-500/85"
                    onClick={() => onDelete(row.original)}
                >
                    Delete
                </Button>
            </div>
        )
    },
]
