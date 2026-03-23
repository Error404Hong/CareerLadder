"use client"

import { Application } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
    reviewed: { label: "Reviewed", className: "bg-blue-100 text-blue-700 border border-blue-200" },
    shortlisted: { label: "Shortlisted", className: "bg-purple-100 text-purple-700 border border-purple-200" },
    accepted: { label: "Accepted", className: "bg-green-100 text-green-700 border border-green-200" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-600 border border-red-200" },
}

export const getColumns = (
    onView: (application: Application) => void
): ColumnDef<Application>[] => [
        {
            id: "applicant",
            header: () => <span className="text-sm font-medium text-left block">Applicant</span>,
            cell: ({ row }) => (
                <span className="text-sm font-medium text-[#0f172a]">
                    {row.original.first_name} {row.original.last_name}
                </span>
            )
        },
        {
            accessorKey: "major",
            header: () => <span className="text-sm font-medium text-left block">Major</span>,
            cell: ({ row }) => <span className="text-sm text-slate-500">{row.getValue("major")}</span>
        },
        {
            accessorKey: "applied_at",
            header: ({ column }) => (
                <button
                    className="text-sm font-medium text-left cursor-pointer flex items-center gap-1"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Applied <ArrowUpDown size={12} />
                </button>
            ),
            cell: ({ row }) => (
                <span className="text-sm text-slate-500">
                    {new Date(row.getValue("applied_at")).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                </span>
            )
        },
        {
            accessorKey: "status",
            header: () => <span className="text-sm font-medium text-left block">Status</span>,
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                const config = statusConfig[status] ?? { label: status, className: "bg-slate-100 text-slate-500 border border-slate-200" }
                return (
                    <span className={`inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full ${config.className}`}>
                        {config.label}
                    </span>
                )
            }
        },
        {
            id: "actions",
            header: () => <span className="text-sm font-medium text-left block">Actions</span>,
            cell: ({ row }) => (
                <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer text-xs"
                    onClick={() => onView(row.original)}
                >
                    View
                </Button>
            )
        }
    ]