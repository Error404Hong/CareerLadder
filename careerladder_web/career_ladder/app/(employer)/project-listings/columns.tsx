"use client"

import { Project } from "@/types/project"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Pencil, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

const statusConfig: Record<string, { label: string; className: string }> = {
    open: { label: "Open", className: "bg-green-100 text-green-700 border border-green-200" },
    closed: { label: "Closed", className: "bg-red-100 text-red-600 border border-red-200" },
}

export const getColumns = (
    onDelete: (project: Project) => void,
    onEdit: (id: string) => void,
    onView: (id: string) => void
): ColumnDef<Project>[] => [
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
            accessorKey: "allowance",
            header: () => <span className="text-sm font-medium text-left block">Allowance</span>,
            cell: ({ row }) => (
                <span className="text-sm text-slate-500">RM {Number(row.getValue("allowance")).toLocaleString()}/mo</span>
            )
        },
        {
            accessorKey: "duration",
            header: () => <span className="text-sm font-medium text-left block">Duration</span>,
            cell: ({ row }) => <span className="text-sm text-slate-500">{row.getValue("duration")}</span>
        },
        {
            accessorKey: "vacancies",
            header: () => <span className="text-sm font-medium text-left block">Vacancies</span>,
            cell: ({ row }) => <span className="text-sm text-slate-500">{row.getValue("vacancies")}</span>
        },
        {
            accessorKey: "application_count",
            header: () => <span className="text-sm font-medium text-left block">Applications</span>,
            cell: ({ row }) => <span className="text-sm text-slate-500">{Number(row.getValue("application_count"))}</span>
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
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="cursor-pointer text-slate-400 hover:text-[#0f172a] h-8 w-8 p-0"
                        onClick={() => onEdit(row.original.id)}
                    >
                        <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" className="cursor-pointer text-slate-400 hover:text-[#2563eb] h-8 w-8 p-0"
                        onClick={() => onView(row.original.id)}
                    >
                        <Eye size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" className="cursor-pointer text-slate-400 hover:text-red-500 h-8 w-8 p-0"
                        onClick={() => onDelete(row.original)}
                    >
                        <Trash2 size={14} />
                    </Button>
                </div>
            )
        },
    ]